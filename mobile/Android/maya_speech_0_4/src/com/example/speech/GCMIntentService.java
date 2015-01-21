package com.example.speech;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import com.google.android.gcm.GCMBaseIntentService;

public class GCMIntentService extends GCMBaseIntentService {

		
	public GCMIntentService() {
		super(Helper.IDSENDER_ANDROID_KEY);
		Log.d("GCMTest", "Sender ID (Android)=" + Helper.IDSENDER_ANDROID_KEY);
	}

	@Override
	protected void onError(Context context, String errorId) {
		Log.d("GCMTest", "REGISTRATION: Error -> " + errorId);
	}

	@Override
	protected void onMessage(Context context, Intent intent) {
		
		String msg = intent.getExtras().getString("message");
		String ext = intent.getExtras().getString("extra");
		String nmb = intent.getExtras().getString("number");
		String idMessage = intent.getExtras().getString("idMessage");
		//String event = intent.getExtras().getString("eventSenderID");
		
		//Log.d("GCMTest", "Mensaje: " + msg);	
		//Log.d("GCMTest", "Extra: " + ext);	
		//Log.d("GCMTest", "Number: " + nmb);
		Log.d("GCMTest", "idMessage: " + idMessage);
		//Log.d("GCMTest", "event: " + event);
		
		String mensaje = "[M]: "+msg +"\n\n"; //+"\n-event: "+event
		
		SharedPreferences prefs =
			     context.getSharedPreferences(MainActivity.PUSH_PREFERENCES_NAME, Context.MODE_PRIVATE);
		SharedPreferences.Editor editor = prefs.edit();
       editor.putString(MainActivity.PUSH_PREFERENCES_NAME_MESSAGE, mensaje);
       editor.commit();  
       
		mostrarNotificacion(context, msg, ext, nmb, idMessage); // event,
	}

	@Override
	protected void onRegistered(Context context, String regId) {
    	Log.d("GCMTest", "Token :"+regId);   
    	
		SharedPreferences prefs =
			     context.getSharedPreferences(MainActivity.PUSH_PREFERENCES_NAME, Context.MODE_PRIVATE);
		String token_old = prefs.getString(MainActivity.PUSH_PREFERENCES_NAME_TOKEN_NEW, "");
		SharedPreferences.Editor editor = prefs.edit();
        editor.putString(MainActivity.PUSH_PREFERENCES_NAME_TOKEN_OLD, token_old);
        editor.putString(MainActivity.PUSH_PREFERENCES_NAME_TOKEN_NEW, regId);
        
        editor.commit();
        
        
//	   
//        Intent intent = new Intent(context,
//		        GcmActivity.class);	    
//	    
//	    intent.setAction(Intent.ACTION_VIEW);
//	    //intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
//	    intent.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
//
//	    getApplication().startActivity(intent);
//	    
//	    PendingIntent contIntent = PendingIntent.getActivity(
//		        context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
//	    try {
//			contIntent.send();
//		} catch (CanceledException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
	        
		    
	}

	@Override
	protected void onUnregistered(Context context, String regId) {
		Log.d("GCMTest", "REGISTRATION: Desregistrado OK.");
	}	
	
	@SuppressWarnings("deprecation")
	private void mostrarNotificacion(Context context, String msg, String ext, String nmb, String idMessage) //String event, 
	{
		
	    //Obtenemos una referencia al servicio de notificaciones
	    String ns = Context.NOTIFICATION_SERVICE;
	    NotificationManager notManager =
	        (NotificationManager) context.getSystemService(ns);
	 
	    //Configuramos la notificación
	    //int icono = android.R.drawable.stat_sys_warning;
	    int icono = android.R.drawable.ic_dialog_email;
	    CharSequence textoEstado = "Maya";
	    long hora = System.currentTimeMillis();
	 
	    Notification notif =
	        new Notification(icono, textoEstado, hora);
	 
	    //Configuramos el Intent
	    Context contexto = context.getApplicationContext();
	    CharSequence titulo = "Maya";
	    CharSequence descripcion = "Nuevo Mensaje";
	 
	    Intent notIntent = new Intent(contexto, MensajeActivity.class);	    
	    	
	    	notIntent.putExtra("mensaje", msg);
	    	notIntent.putExtra("extra", ext);
	    	notIntent.putExtra("number", nmb);
	    	notIntent.putExtra("idMessage", idMessage);

	    PendingIntent contIntent = PendingIntent.getActivity(contexto, 0, notIntent, PendingIntent.FLAG_UPDATE_CURRENT);

	    notif.setLatestEventInfo(
	        contexto, titulo, descripcion, contIntent);
	 
	    //AutoCancel: cuando se pulsa la notificacion esta desaparece
	    notif.flags |= Notification.FLAG_AUTO_CANCEL;
	    notif.defaults |= Notification.DEFAULT_VIBRATE;
	 
	    //Enviar notificacion
	    notManager.notify(1, notif);
	}
	
}
