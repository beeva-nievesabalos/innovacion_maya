package com.example.speech;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.net.ParseException;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.TextToSpeech.OnInitListener;
import android.speech.tts.TextToSpeech.OnUtteranceCompletedListener;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.ToggleButton;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import android.speech.tts.TextToSpeech;
import android.speech.tts.TextToSpeech.OnUtteranceCompletedListener;
import android.util.Log;
import android.widget.Toast;
import android.speech.tts.TextToSpeech.OnInitListener;

public class MensajeActivity extends Activity implements OnInitListener, OnUtteranceCompletedListener{
	private static final String TAG = "MensajeActivity";
	private TextView mensaje;
	private TextView fecha;
	private String msjRecibido;
	private TextToSpeech myTTS;
	private int MY_DATA_CHECK_CODE = 0;
    private String textoToTTS;
    
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_mensaje);
		
		//CONFIGURAR EL TTS
        Intent checkTTSIntent = new Intent();
        checkTTSIntent.setAction(TextToSpeech.Engine.ACTION_CHECK_TTS_DATA);
        startActivityForResult(checkTTSIntent, MY_DATA_CHECK_CODE);
        
		//MENSAJE:
		Typeface tf_nexa_bold = Typeface.createFromAsset(getAssets(), "fonts/nexa_bold.ttf");
		mensaje = (TextView) findViewById(R.id.lblMensaje);
		mensaje.setTypeface(tf_nexa_bold);
		
		//FECHA:
		Typeface tf_nexa_light = Typeface.createFromAsset(getAssets(), "fonts/nexa_light.ttf");
		fecha = (TextView) findViewById(R.id.lblFecha);
		fecha.setTypeface(tf_nexa_light);
		
		SimpleDateFormat  dateformat = new SimpleDateFormat("dd/MM/yyyy' - 'HH:mm:ss' '");  
		try {  
			Date date = new Date();  
			String datetime = dateformat.format(date);
			fecha.setText(datetime); 
		} catch (ParseException e) {  
		    // TODO Auto-generated catch block  
		    e.printStackTrace();  
		}
		
		
		final Bundle extras = getIntent().getExtras();
		if(extras !=null){
			msjRecibido = extras.getString("mensaje");
			final String hashNotificacion = extras.getString("number");
			//String eventSender = extras.getString("event");
			Log.d(TAG, "TEXTO recibido: " + msjRecibido);  
			Log.d(TAG, "HASH notif: " + hashNotificacion); 
 
			if(msjRecibido !=null){
				// send ACK to /api/notify/ack/:hashN
				new Thread(new Runnable() {
				    public void run() {
				    	sendACKMaya("http://46.137.73.238:3000/api/notify/ack/" + hashNotificacion); 
				    }
				}).start();
				mensaje.setText(msjRecibido);
			}
			
		}else{
			mensaje.setText("vacio");
			Log.d(TAG, "TEXTO vacio.");  
		}
		
		
		SharedPreferences prefs = getApplicationContext()
				.getSharedPreferences(MainActivity.PUSH_PREFERENCES_NAME,
						Context.MODE_PRIVATE);
		
		final String appID=prefs.getString(MainActivity.PUSH_PREFERENCES_NAME_APPID, Helper.DEFAULT_APPID);
		final String host=prefs.getString(MainActivity.PUSH_PREFERENCES_HOST, Helper.getDefaultHost());
		
		new Thread(new Runnable() {
		    public void run() {
		    	sendACK(host, extras.getString("idMessage"), "0.5", Helper.DEFAULT_KEY, "xml", "xml", appID);
		    }
		}).start(); 
		
	}

	 @Override
	 protected void onStop(){
	        super.onStop();
	        if(myTTS != null){
	        	myTTS.shutdown();
	        }       
	 }

	    
	@Override
	public void onDestroy() {
	    	super.onDestroy();
	    	Log.d(TAG, "onDestroy");
	    	myTTS.stop();
	    	myTTS.shutdown();
	    	
	}
	
	public void onToggleClicked(View view) {
	    // Is the toggle on?
		//ToggleButton btnToggle = (ToggleButton)findViewById(R.id.togglebutton);
	    boolean on = ((ToggleButton) view).isChecked();
	    
	    if (on) {
	        /* Enable TTS!!!!
			Intent intent1 = new Intent(MensajeActivity.this, textToSpeech.class); //MyService.this
	    	intent1.putExtra("TTS", msjRecibido);
	    	intent1.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
	    	Context context = this.getApplicationContext();
	    	context.startActivity(intent1);*/
	    	
	    	textoToTTS = msjRecibido;
	    	//Puede devolver null si ha habido un error o puede estar vacio por parsear mal...
			if(textoToTTS != null){
				if (textoToTTS.compareTo("") != 0)
					speakWords(textoToTTS);
				else 
					speakWords("Error. Ningún texto para sintetizar.");
			}
	    	
	    } else {
	        // Disable TTS
	    	myTTS.stop();
	    	if(myTTS != null){
	        	myTTS.shutdown();
	        }  
	    }
	}

	private void sendACKMaya(String url){
		
			try{
				Log.d(TAG, "Ack maya sent to: " + url);  
				HttpClient httpclient = new DefaultHttpClient();
				HttpGet request = new HttpGet();
				request.setURI(new URI(url));

				HttpResponse response = httpclient.execute(request);
				//HttpEntity entity = response.getEntity();
				//is = entity.getContent();
			}catch(Exception e){
				Log.d(TAG, "Ack maya ERROR: " + e);  
			}
	}
	
	
	public String sendACK(String host,String messageId,String pushVersion,String idSender,String acceptType,String contentType,String appId){
		HttpClient httpClient; 
		httpClient = new DefaultHttpClient();
		HttpPut put = null;
		
		String tipo=""; //Se usa para saber el tipo de conexion y poder coger la respuesta adecuada
		String url=new StringBuffer(host).append("/messages/").append(messageId).toString();
		
		tipo="put";

		String idApp=appId+":".toString();
		byte[] cadenabyte = (idApp.getBytes());
		//Codificamos los bytes recogidos anteriormente a Base64
		String idAppB64 = Base64.encodeToString(cadenabyte, Base64.URL_SAFE|Base64.NO_WRAP);
		
		
		Log.d("GCMTest", "url: "+url);
		
		put = new HttpPut(url);		
		put.setHeader("Authorization","Basic "+ idAppB64);
		put.setHeader("Content-Type", contentType);
		put.setHeader("Accept", acceptType);
		
					
			
	//hasta la version 0.4 inclusive
		if (contentType.equals("json")) {
				String dato = "{"+
				"\"message\":{\"status\": \"RECEIVED\" }}";
				
				StringEntity entity;
				try {
					entity = new StringEntity(dato);
					Log.d("GCMTest","envio "+entity);
					put.setEntity(entity);
				} catch (UnsupportedEncodingException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			} else {
				String dato = "<message><status>RECEIVED</status></message>";

				StringEntity entity;
				try {
					entity = new StringEntity(dato);
					Log.d("GCMTest","envio "+entity);
					put.setEntity(entity);
				} catch (UnsupportedEncodingException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		
		String respStr="";
		HttpResponse resp;
		try {
			
				resp = httpClient.execute(put);
				respStr = EntityUtils.toString(resp.getEntity());
				Log.d("GCMTest","respuesta "+respStr);
			
			
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return respStr;
		
	}
	
	
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    	if (requestCode == MY_DATA_CHECK_CODE) {
    		// Consulta si tiene instalado el dispositivo el TTS
    		if (resultCode == TextToSpeech.Engine.CHECK_VOICE_DATA_PASS) {
    			// success, create the TTS instance
    			myTTS = new TextToSpeech(this, this);
    		}
    		else {
    			// Si no, lo instala
    			Intent installTTSIntent = new Intent();
    			installTTSIntent.setAction(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
    			startActivity(installTTSIntent);
    		}
        }
    }
    
    public void onInit(int initStatus) {
    	if (initStatus == TextToSpeech.SUCCESS) {
    		// checks on the user device, such as available languages
    		// Aqui selecciona el idioma del TTS (ej: US English Locale = Locale.US):
    		// new Locale("es", "ES")  ->  will return TextToSpeech.LANG_COUNTRY_AVAILABLE to indicate that the language AND country
    		// new Locale("es") -> will return TextToSpeech.LANG_AVAILABLE
    		if(myTTS.isLanguageAvailable(new Locale("es"))==TextToSpeech.LANG_AVAILABLE) {
    			myTTS.setLanguage(new Locale("es"));
    			myTTS.setOnUtteranceCompletedListener(this);
    			Log.d(TAG, "onInit");	
    		}
    	}
    	else if (initStatus == TextToSpeech.ERROR) {
    		Toast.makeText(this, "¡Lo sentimos! Ha fallado el Text To Speech...", Toast.LENGTH_LONG).show();
    	}
    }
    
    private void speakWords(String speech) {
    	Log.d(TAG, "Speaking");
    	//  you can pass a HashMap object indicating the details of more complex playback options.
    	//implement TTS here
    	// METODO 1:  instructs the app to speak the text string immediately
    	//myTTS.speak(speech, TextToSpeech.QUEUE_FLUSH, null);
    	// METODO 2:  instruct the app to wait until any current speech operations finish 
    	myTTS.speak(speech, TextToSpeech.QUEUE_ADD, null);
    	
    }
    
    public void onUtteranceCompleted(String utteranceId) {
    	   Log.i(TAG, "FIN utterance" + utteranceId); //utteranceId == "SOME MESSAGE"
    	   //finish();
    }
    	
}
