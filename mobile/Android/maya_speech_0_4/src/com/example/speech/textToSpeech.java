package com.example.speech;

import java.util.Locale;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.TextToSpeech.OnUtteranceCompletedListener;
import android.util.Log;
import android.widget.Toast;
import android.speech.tts.TextToSpeech.OnInitListener;

public class textToSpeech extends Activity implements OnInitListener, OnUtteranceCompletedListener {
	private static final String TAG = "TTS";
	private TextToSpeech myTTS;
	private int MY_DATA_CHECK_CODE = 0;
    private String textoToTTS;
	
    @Override
    protected void onCreate(Bundle savedInstanceState) {
    	Log.d(TAG, "onCreate");
    	super.onCreate(savedInstanceState);

        // para el tts
        Intent checkTTSIntent = new Intent();
        checkTTSIntent.setAction(TextToSpeech.Engine.ACTION_CHECK_TTS_DATA);
        startActivityForResult(checkTTSIntent, MY_DATA_CHECK_CODE);
        
        Bundle extras = getIntent().getExtras();
        if(extras == null) {
        	textoToTTS = null;
        } else {
        	textoToTTS = extras.getString("TTS");
        }
        
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
    	

    /*************** TTS ************************/    
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
    	    	//Puede devolver null si ha habido un error o puede estar vacio por parsear mal...
    			if(textoToTTS != null){
    				if (textoToTTS.compareTo("") != 0)
    					speakWords(textoToTTS);
    				else 
    					speakWords("Error. Ningún texto para sintetizar.");
    			}
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
