//
//  MMViewController.m
//  Maya Mobile
//
//  Created by Juanpe Catalán  on 19/04/13.
//  Copyright (c) 2013 Juanpe Catalán . All rights reserved.
//

#import "MMViewController.h"

#define kMainViewVisibleFrame CGRectMake(0.0f, 0.0f, 320.0f, 548.0f)
#define kMainViewHiddenFrame CGRectMake(0.0f, -500.0f, 320.0f, 548.0f)


@interface MMViewController ()

- (void) _handlePan:(UIPanGestureRecognizer *) recognizer;

@end

@implementation MMViewController

- (void) viewDidLoad
{
    [super viewDidLoad];
    
    UIPanGestureRecognizer* panGesture = [[UIPanGestureRecognizer alloc] initWithTarget:self
                                                                                 action:@selector(_handlePan:)];
    
    [_mainView addGestureRecognizer:panGesture];
    
    [panGesture release];
    
    // Nos hacemos delegado del buscador de BLEs
    [[MMBLEManager sharedSingleton] setDelegate:self];
}

#pragma mark - IBActions -

- (IBAction) btnStartScanTouchUpInside:(id) sender{
    
    [[MMBLEManager sharedSingleton] startScan];
    [self writeConsoleMsg:@"Empezamos a escanear"];
}

#pragma mark - MMBLEManager - 

- (void)  userEnterZone{
    
    MMRequestConnect* reqConnect = [[MMRequestConnect alloc] init];
    [reqConnect setDelegate:self];
    
    [_placeLabel setText:@"En innovación"];
    
    [_spinLoading startAnimating];
    [_sendingRequestLabel setHidden:NO];
    
    [reqConnect sendAsyncRequestUserEnter];
}

- (void)  userLeaveZone{

    MMRequestConnect* reqConnect = [[MMRequestConnect alloc] init];
    [reqConnect setDelegate:self];
    
    [_placeLabel setText:@"Fuera de innovación"];
    
    [_spinLoading startAnimating];
    [_sendingRequestLabel setHidden:NO];
    
    [reqConnect sendAsyncRequestUserLeave];
}

- (void) didStartScanBLE{

    [_ledBluetoothIndicator setImage:[UIImage imageNamed:@"ledOn@2x"]];
    
}

- (void) didEndScanBLE{

    [_ledBluetoothIndicator setImage:[UIImage imageNamed:@"ledOff@2x"]];
}

#pragma mark - MMRequestConnectDelegate Methods -

- (void) didFinishSendRequestUserEnter:(id) reqConnectObj{

    [reqConnectObj release];
    
    [_spinLoading stopAnimating];
    [_sendingRequestLabel setHidden:YES];
    
    NSLog(@"Terminamos de enviar la petición de que el usuario ha entrado");
    [self writeConsoleMsg:@"Terminamos de enviar la petición de que el usuario ha entrado"];
}

- (void) didFinishSendRequestUserLeave:(id) reqConnectObj{

    [reqConnectObj release];
    
    [_spinLoading stopAnimating];
    [_sendingRequestLabel setHidden:YES];
    
    NSLog(@"Terminamos de enviar la petición de que el usuario ha salido");
    [self writeConsoleMsg:@"Terminamos de enviar la petición de que el usuario ha salido"];
}

#pragma mark - Console Methods -

- (void) writeConsoleMsg:(NSString *) msg{
    
    NSString* currentMsg    = [[_consoleView text] retain];
    
    if (![currentMsg isEqualToString:@""]) {
        currentMsg              = [currentMsg stringByAppendingString:@"\n\n"];
    }
    
    currentMsg              = [currentMsg stringByAppendingString:[NSString stringWithFormat:@"%@ --> %@",[NSDate date],msg]];
    
    [_consoleView setText:currentMsg];
    
    if (_consoleView.contentSize.height > _consoleView.bounds.size.height) {
        CGPoint bottomOffset = CGPointMake(0, _consoleView.contentSize.height - _consoleView.bounds.size.height);
        [_consoleView setContentOffset:bottomOffset animated:YES];
    }
}

#pragma mark - Private Methods -

- (void) _handlePan:(UIPanGestureRecognizer *)recognizer{

    CGPoint translation = [recognizer translationInView:self.view];
    [recognizer setTranslation:CGPointMake(0, 0) inView:self.view];
    
    CGPoint center   = recognizer.view.center;
    center.y        += translation.y;
    
    if (center.y >= 274.0f || center.y <= -222.0f)
        return;
    recognizer.view.center = center;
}

#pragma mark -

- (void)didReceiveMemoryWarning{
    
    [super didReceiveMemoryWarning];
}

- (void) dealloc{

    [_spinLoading release], _spinLoading = nil;
    [_placeLabel release], _placeLabel = nil;
    [_sendingRequestLabel release], _sendingRequestLabel = nil;
    [_mainView release], _mainView = nil;
    [_consoleView release], _consoleView = nil;
    [_ledBluetoothIndicator release], _ledBluetoothIndicator = nil;
    
    [[MMBLEManager sharedSingleton] setDelegate:nil];
    
    [super dealloc];
}

- (void)viewDidUnload {
    
    [_spinLoading release], _spinLoading = nil;
    [_placeLabel release], _placeLabel = nil;
    [_sendingRequestLabel release], _sendingRequestLabel = nil;
    [_mainView release], _mainView = nil;
    [_consoleView release], _consoleView = nil;
    [_ledBluetoothIndicator release], _ledBluetoothIndicator = nil;
    
    [[MMBLEManager sharedSingleton] setDelegate:nil];
    
    [super viewDidUnload];
}

@end
