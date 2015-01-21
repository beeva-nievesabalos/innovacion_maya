//
//  MMBLEManager.h
//  Maya Mobile
//
//  Created by Juanpe Catalán  on 28/05/13.
//  Copyright (c) 2013 Juanpe Catalán . All rights reserved.
//

#import "BLE.h"

@protocol MMBLEManagerDelegate;

@interface MMBLEManager : NSObject <BLEDelegate>{


}
@property (nonatomic, retain) BLE *ble;
@property (nonatomic, assign) NSObject <MMBLEManagerDelegate>* delegate;

+ (MMBLEManager *) sharedSingleton;

- (void) startScan;
- (void) stopScan;

@end

@protocol MMBLEManagerDelegate <NSObject>

@optional
- (void) didStartScanBLE;
- (void) didEndScanBLE;

@required
- (void)  userEnterZone;
- (void)  userLeaveZone;

@end
