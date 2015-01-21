//
//  MMBLEManager.m
//  Maya Mobile
//
//  Created by Juanpe Catalán  on 28/05/13.
//  Copyright (c) 2013 Juanpe Catalán . All rights reserved.
//

#import "MMBLEManager.h"
#import "MMViewController.h"

#define kBLEScanTimeout 2
#define kRSSIMinInRange -65

#define kIsInsideInnovationRoom @"IsInsideInnovationRoom"

static NSInteger refreshFreq;

@interface MMBLEManager ()

- (BOOL) _isInRange:(NSNumber *) rssiNumber;
- (void) _reScanWithDelay;

@end

@implementation MMBLEManager

+ (MMBLEManager *) sharedSingleton {
    static MMBLEManager *_sharedSingleton = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedSingleton = [[self alloc] initSingleton];
    });
    
    return _sharedSingleton;
}

/* Init que realmente se ejecuta (privado) */
- (MMBLEManager *) initSingleton {
    self = [super init];
    if (self) {
        
        // Freq refresco
        refreshFreq = 5;
        
        // Inicializamos el BLE
        self.ble = [[BLE alloc] init];
        [self.ble controlSetup:1];
        self.ble.delegate = self;
    }
    return self;
}

- (id)init
{
    NSAssert(NO, @"No se pueden crear instancias adicionales de este singleton. Utiliza el método sharedSingleton.");
    
    // Podemos devolver "nil" o "[self sharedSingleton]"
    return nil;
}

+ (id)new
{
    NSAssert(NO, @"No se pueden crear instancias adicionales de este singleton. Utiliza el método sharedSingleton.");
    
    // Podemos devolver "nil" o "[self sharedSingleton]"
    return nil;
}

#pragma mark - Custom Methods - 

- (void) startScan{

    [self.ble findBLEPeripherals:kBLEScanTimeout];
    
    if ([_delegate respondsToSelector:@selector(didStartScanBLE)]) {
        [_delegate didStartScanBLE];
    }
}

- (void) stopScan{

}

#pragma mark - BLEDelegate Methods -

- (void) bleDidFinishScan{
    
    if ([_delegate respondsToSelector:@selector(didEndScanBLE)]) {
        [_delegate didEndScanBLE];
    }

    NSLog(@"Hay %d dispositivos", self.ble.peripherals.count);
    [((MMViewController *)_delegate) writeConsoleMsg:[NSString stringWithFormat:@"Hay %d dispositivos", self.ble.peripherals.count]];
    
    if ([self.ble.peripherals count] != 0) {
        
        // Hemos encontrado un dispositivo
        // y nos conectamos a el
        
        [self.ble connectPeripheral:[self.ble.peripherals objectAtIndex:0]];
        
    }else{
    
        // No hemos encontrado ningún dispositivo
        
        [self _reScanWithDelay];
    }
}

- (void) bleDidDisconnect{
    
    //NSLog(@"->Disconnected VC");
    
}

- (void) bleDidUpdateRSSI:(NSNumber *) rssi{
    
    NSLog(@"RSSI Value %@", rssi);
    [((MMViewController *)_delegate) writeConsoleMsg:[NSString stringWithFormat:@"RSSI Value %@", rssi]];
    
    [[self.ble CM] cancelPeripheralConnection:[self.ble activePeripheral]];
    
    // Hemos encontrado algún dispositivo, ahora comprobamos
    // que estamos dentro del rango estimado
    
    if ([self _isInRange:rssi]) {
        
        // Estamos dentro del rango
        
        if (![[NSUserDefaults standardUserDefaults] boolForKey:kIsInsideInnovationRoom]) {
            
             NSLog(@"No estaba en la oficina antes");
            [((MMViewController *)_delegate) writeConsoleMsg:[NSString stringWithFormat:@"No estaba en la oficina antes"]];
            
            [[NSUserDefaults standardUserDefaults] setBool:YES
                                                    forKey:kIsInsideInnovationRoom];
            
            [[NSUserDefaults standardUserDefaults] synchronize];
        
            
            if ([_delegate respondsToSelector:@selector(userEnterZone)]) {
                [_delegate userEnterZone];
            }
            
        }else{
            
            NSLog(@"Ya estabamos en la oficina");
            [((MMViewController *)_delegate) writeConsoleMsg:[NSString stringWithFormat:@"Ya estabamos en la oficina"]];
        }
        
    }else{
        
        
        
        if ([[NSUserDefaults standardUserDefaults] boolForKey:kIsInsideInnovationRoom]) {
            
            // Ya estamos fuera de rango
            
            NSLog(@"Ya estamos fuera de rango");
            [((MMViewController *)_delegate) writeConsoleMsg:[NSString stringWithFormat:@"Ya estamos fuera de rango"]];
            
            [[NSUserDefaults standardUserDefaults] setBool:NO
                                                    forKey:kIsInsideInnovationRoom];
            
            [[NSUserDefaults standardUserDefaults] synchronize];
            
            if ([_delegate respondsToSelector:@selector(userLeaveZone)]) {
                [_delegate userLeaveZone];
            }
            
        }else{
            
            NSLog(@"Ya estabamos fuera de rango");
            [((MMViewController *)_delegate) writeConsoleMsg:[NSString stringWithFormat:@"Ya estabamos fuera de rango"]];
        }
    }
    
    [self _reScanWithDelay];
}

- (void) bleDidConnect{
    
    //NSLog(@"->Connected VC");
}

- (void) bleDidReceiveData:(unsigned char *)data length:(int)length{
    
    //NSLog(@"Length: %d", length);
}

#pragma mark - Private Methods -

- (BOOL) _isInRange:(NSNumber *) rssiNumber{
    
    return ([rssiNumber floatValue] >= kRSSIMinInRange);
}

- (void) _reScanWithDelay{
    
    // TODO: Comprobar cuantas veces hemos buscado para aumentar el tiempo
    [self performSelector:@selector(startScan)
               withObject:nil
               afterDelay:refreshFreq];
}

@end
