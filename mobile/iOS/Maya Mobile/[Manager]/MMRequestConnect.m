//
//  MMRequestConnect.m
//  Maya Mobile
//
//  Created by Juanpe Catalán  on 30/05/13.
//  Copyright (c) 2013 Juanpe Catalán . All rights reserved.
//

#import "MMRequestConnect.h"

#define kURLUserEnter @"http://46.137.73.238:3000/api/events/new/llegada/nieves"
#define kURLUserLeave @"http://46.137.73.238:3000/api/events/new/salida/nieves"

#define kTagRequestUserEnter 0
#define kTagRequestUserLeave 1

@implementation MMRequestConnect

#pragma mark - Request Methods -

- (void) sendAsyncRequestUserEnter{

    // Creamos el request con la URL
    NSURLRequest *theRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:kURLUserEnter]]
                                                cachePolicy:NSURLRequestUseProtocolCachePolicy
                                            timeoutInterval:60.0];
    
    // Creamos la conexión a partir del request, al crearla se lanza automáticamente
    NSURLConnection *theConnection  =   [[NSURLConnection alloc] initWithRequest:theRequest delegate:self];
    
    // Si se ha creado correctamente iniciamos los datos
    if (theConnection) {
        
        _tagRequest     = kTagRequestUserEnter;
        _receivedData   = [[NSMutableData data] retain];
        
    } else {
        NSLog(@"ERROR => La petición ha fallado!");
    }
}

- (void) sendAsyncRequestUserLeave{
    
    // Creamos el request con la URL
    NSURLRequest *theRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:kURLUserLeave]]
                                                cachePolicy:NSURLRequestUseProtocolCachePolicy
                                            timeoutInterval:60.0];
    
    // Creamos la conexión a partir del request, al crearla se lanza automáticamente
    NSURLConnection *theConnection  =   [[NSURLConnection alloc] initWithRequest:theRequest delegate:self];
    
    // Si se ha creado correctamente iniciamos los datos
    if (theConnection) {
        
        _tagRequest     = kTagRequestUserLeave;
        _receivedData   = [[NSMutableData data] retain];
        
    } else {
        NSLog(@"ERROR => La petición ha fallado!");
    }
}

#pragma mark - NSURLConnection Asynchronous methods -

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response{
    
    [_receivedData setLength:0];
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data{
    
    // Añadimos los bytes
    [_receivedData appendData:data];
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection{
    
    // Borramos la conexión y los datos
    [connection release];
    [_receivedData release];
    
    // Avisamos al delegado
    
    if (_tagRequest == kTagRequestUserEnter) {
        if ([_delegate respondsToSelector:@selector(didFinishSendRequestUserEnter:)]) {
            [_delegate didFinishSendRequestUserEnter:self];
        }
    }else{
        if ([_delegate respondsToSelector:@selector(didFinishSendRequestUserLeave:)]) {
            [_delegate didFinishSendRequestUserLeave:self];
        }
    }
    
    NSLog(@"Connection finish successfully");
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error{
    
    [connection release];
    [_receivedData release];
    
    NSLog(@"Connection failed! Error - %@ %@",
          [error localizedDescription],
          [[error userInfo] objectForKey:NSURLErrorFailingURLStringErrorKey]);
}


@end
