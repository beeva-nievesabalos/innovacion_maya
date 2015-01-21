//
//  MMViewController.h
//  Maya Mobile
//
//  Created by Juanpe Catalán  on 19/04/13.
//  Copyright (c) 2013 Juanpe Catalán . All rights reserved.
//

#import "MMBLEManager.h"
#import "MMRequestConnect.h"

@interface MMViewController : UIViewController <MMBLEManagerDelegate, MMRequestConnectDelegate>{

    // Datos obtenidos
    NSMutableData* _receivedData;

}
@property (nonatomic, retain) IBOutlet UIActivityIndicatorView *spinLoading;
@property (nonatomic, retain) IBOutlet UILabel *placeLabel;
@property (nonatomic, retain) IBOutlet UILabel *sendingRequestLabel;
@property (nonatomic, retain) IBOutlet UIView *mainView;
@property (nonatomic, retain) IBOutlet UITextView *consoleView;
@property (nonatomic, retain) IBOutlet UIImageView *ledBluetoothIndicator;

// +-------------------------------------------------------------
// | @name IBActions
// +-------------------------------------------------------------
- (IBAction) btnStartScanTouchUpInside:(id) sender;

///--------------------------------------------------------------------------------
/// @name Debug
///--------------------------------------------------------------------------------

/** Método que escribe los mensajes en la consola de la app.
 
 @param msg Mensaje a mostrar.
 */
- (void) writeConsoleMsg:(NSString *) msg;

@end
