//
//  MMRequestConnect.h
//  Maya Mobile
//
//  Created by Juanpe Catalán  on 30/05/13.
//  Copyright (c) 2013 Juanpe Catalán . All rights reserved.
//

@protocol MMRequestConnectDelegate;

@interface MMRequestConnect : NSObject{

    // Datos obtenidos
    NSMutableData* _receivedData;
    
    // Tag Request
    NSInteger       _tagRequest;
    
}
@property (nonatomic, retain) NSMutableData* receivedData;
@property (nonatomic, assign) NSObject <MMRequestConnectDelegate>* delegate;

/// +------------------------------------------------------------------------------
/// | @name Request Methods
/// +------------------------------------------------------------------------------

- (void) sendAsyncRequestUserEnter;
- (void) sendAsyncRequestUserLeave;

@end


@protocol MMRequestConnectDelegate <NSObject>

- (void) didFinishSendRequestUserEnter:(id) reqConnectObj;
- (void) didFinishSendRequestUserLeave:(id) reqConnectObj;

@end