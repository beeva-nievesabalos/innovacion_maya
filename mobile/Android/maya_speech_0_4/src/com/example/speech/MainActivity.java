package com.example.speech;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import com.google.android.gcm.GCMRegistrar;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.Settings.Secure;
import android.app.Activity;
import android.util.Log;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.view.View;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class MainActivity extends Activity {
	private static final String TAG = "MainActivity";
	//Button buttonStart, buttonStop;
	private Button btnRegistrar, btnDesRegistrar;	
	static Button btnRefrescarConsola;
	public EditText appID;
	public EditText userID;
	public EditText alias;
	String[] datosHost=Helper.getHostsAvailables();
	
	public static EditText consola;
	private Spinner comboAccept, comboEnv;
	final String[] datos = new String[] { "XML", "JSON" };
	
	public static final String PUSH_PREFERENCES_NAME="PushPreferences";
	public static final String PUSH_PREFERENCES_NAME_HOST="hostName";
	public static final String PUSH_PREFERENCES_HOST="host";
	public static final String PUSH_PREFERENCES_NAME_CTYPE="Ctype";
	public static final String PUSH_PREFERENCES_NAME_ACCEPT="Accept";
	public static final String PUSH_PREFERENCES_NAME_TOKEN_NEW="token_new";
	public static final String PUSH_PREFERENCES_NAME_TOKEN_OLD="token_old";
	public static final String PUSH_PREFERENCES_NAME_MESSAGE="message";
	public static final String PUSH_PREFERENCES_NAME_APPID="appID";
	
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_gcm);

        //buttonStart = (Button) findViewById(R.id.buttonStart);
        //buttonStop = (Button) findViewById(R.id.buttonStop);

        //buttonStart.setOnClickListener(this);
        //buttonStop.setOnClickListener(this);
        
        comboAccept = (Spinner) findViewById(R.id.spinnerAccept);
		comboEnv = (Spinner) findViewById(R.id.spinnerEnviroment);
		btnRefrescarConsola = (Button) findViewById(R.id.btnRefreshConsola);
		
		//btnBorrarOldToken = (Button) findViewById(R.id.btnBorrarOldToken);
		btnRegistrar = (Button) findViewById(R.id.btnRegistrar);
		btnDesRegistrar = (Button) findViewById(R.id.btnDesRegistrar);
		
		consola = (EditText) findViewById(R.id.txtConsola);
		//oldToken = (EditText) findViewById(R.id.txtOldToken);

		appID = (EditText) findViewById(R.id.txtAppID);
		
		SharedPreferences prefs = getApplicationContext()
				.getSharedPreferences(PUSH_PREFERENCES_NAME,
						Context.MODE_PRIVATE);

		SharedPreferences.Editor editor = prefs.edit();
		
		String appId = prefs.getString(PUSH_PREFERENCES_NAME_APPID,appID.getText().toString());
		
		if (appId==null || appId.length()==0){
			editor.putString(PUSH_PREFERENCES_NAME_APPID, appID.getText().toString());	
		}else{
			appID.setText(appId);	
		}	

		editor.putString(PUSH_PREFERENCES_NAME_HOST, Helper.getDefaultHost());
		editor.commit();
		
		userID = (EditText) findViewById(R.id.txtUserID);
		alias = (EditText) findViewById(R.id.txtAlias);

		// Comprobamos si esta todo en orden para utilizar GCM
		GCMRegistrar.checkDevice(this);
		GCMRegistrar.checkManifest(this);
		//registrar()
		comprobarRegistro();
		

		// Creamos el adaptador al que pasamos el contexto,el id del layout
		// sobre el que mostraremos los datos y el array con los datos a mostrar
		ArrayAdapter<String> adaptador = new ArrayAdapter<String>(this,
				android.R.layout.simple_spinner_item, datos);
		// Seleccionamos el layout sobre el que mostramos los datos al desplegar
		// la lista
		adaptador
				.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		
		
		
		// Asignamos el adaptador a los spinner
		
		comboAccept.setAdapter(adaptador);
		
		ArrayAdapter<String> adaptadorEnv = new ArrayAdapter<String>(this,
				android.R.layout.simple_spinner_item, datosHost);
		// Seleccionamos el layout sobre el que mostramos los datos al desplegar
		// la lista
		adaptador
				.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
				
		comboEnv.setAdapter(adaptadorEnv);


		
		comboAccept
				.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
					SharedPreferences prefs = getApplicationContext()
							.getSharedPreferences(PUSH_PREFERENCES_NAME,
									Context.MODE_PRIVATE);
					

					public void onItemSelected(AdapterView<?> parent,
							android.view.View v, int position, long id) {
						SharedPreferences.Editor editor = prefs.edit();
						editor.putString(PUSH_PREFERENCES_NAME_ACCEPT, datos[position]);
						editor.commit();
					}

					public void onNothingSelected(AdapterView<?> parent) {
						SharedPreferences.Editor editor = prefs.edit();
						editor.putString(PUSH_PREFERENCES_NAME_ACCEPT, "XML");
						editor.commit();
					}
				});
	
		comboEnv
		.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
			SharedPreferences prefs = getApplicationContext()
					.getSharedPreferences(PUSH_PREFERENCES_NAME,
							Context.MODE_PRIVATE);

			public void onItemSelected(AdapterView<?> parent,
					android.view.View v, int position, long id) {
				SharedPreferences.Editor editor = prefs.edit();
				
				String hostName=datosHost[position];
				String host=Helper.getHost(hostName);
				
				editor.putString(PUSH_PREFERENCES_HOST, host);
				editor.putString(PUSH_PREFERENCES_NAME_HOST, hostName);
				
				//alias.setText(prefs.getString(PUSH_PREFERENCES_NAME_HOST, ""));
				editor.commit();
			}

			public void onNothingSelected(AdapterView<?> parent) {
				SharedPreferences.Editor editor = prefs.edit();
				
				String host=Helper.getHost(Helper.getDefaultHost());
				
				editor.putString(PUSH_PREFERENCES_HOST,host );
				editor.putString(PUSH_PREFERENCES_NAME_HOST, Helper.getDefaultHost());
				
				editor.commit();
			}
		});
		

		btnRegistrar.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				ConexionWSTask conexionWSTask = new ConexionWSTask();
				conexionWSTask.execute("");
			}
		});

		
		btnDesRegistrar.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {

				// Si estamos registrados --> Nos des-registramos en GCM
				final String regId = GCMRegistrar
						.getRegistrationId(MainActivity.this);
				if (!regId.equals("")) {
					GCMRegistrar.unregister(MainActivity.this);					
				} else {
					Log.v("GCMTest", "Ya des-registrado");
				}
			}
		});
		

		btnRefrescarConsola.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				
				SharedPreferences prefs = getApplicationContext().getSharedPreferences(
						PUSH_PREFERENCES_NAME, Context.MODE_PRIVATE);
				String mensaje = prefs.getString(PUSH_PREFERENCES_NAME_MESSAGE, "");
				consola.setText(mensaje);
				Log.d(TAG, "onClick: consola.setText:"+mensaje);
			}
		});
        
        
    }
    
    
    @Override            //onPause()
    protected void onDestroy() {
		super.onDestroy();
    }
   
    
    public static void resultadoNotificacion(String mensaje){
    	Log.d(TAG, "resultadoNotificacion:"+mensaje);
		consola.setText(mensaje);
	}
        
		
//Comprobamos que si se registro en el servicio de google
	private void comprobarRegistro() {
		registrar();
		if (GCMRegistrar.isRegistered(getApplicationContext())) {
			recuperarToken();
		} else {
			registrar();
		}

	}
//Nos registramos en els ervicio de google
	private void registrar() {
		
		GCMRegistrar.unregister(MainActivity.this);
		GCMRegistrar.register(MainActivity.this, Helper.IDSENDER_ANDROID_KEY); // Sender ID
		
		recuperarToken();

	}
//Recuperamos los token almacenados
	private void recuperarToken() {
		// TODO Auto-generated method stub

		SharedPreferences prefs = getApplicationContext().getSharedPreferences(
				PUSH_PREFERENCES_NAME, Context.MODE_PRIVATE);
		//String token_old = prefs.getString("token_old", "");
		String token_new = prefs.getString(PUSH_PREFERENCES_NAME_TOKEN_NEW, "");
	}
	
//Ejecutamos la conexxion al WS en un hilo aparte
	private class ConexionWSTask extends AsyncTask<String, Float, String> {

		protected String doInBackground(String... urls) {

			String respStr = "";

			SharedPreferences prefs = getApplicationContext()
					.getSharedPreferences(PUSH_PREFERENCES_NAME,
							Context.MODE_PRIVATE);
			String ctype = prefs.getString(PUSH_PREFERENCES_NAME_CTYPE, "xml").toLowerCase();
			String accept = prefs.getString(PUSH_PREFERENCES_NAME_ACCEPT, "xml").toLowerCase();
			String host = new StringBuffer(prefs.getString(PUSH_PREFERENCES_HOST,Helper.getDefaultHost())).append("/users").toString();
			String hostName = prefs.getString(PUSH_PREFERENCES_NAME_HOST,Helper.getDefaultHost());
			
			SharedPreferences.Editor editor = prefs.edit();
			editor.putString(PUSH_PREFERENCES_NAME_APPID, appID.getText().toString());
			editor.commit();			
			
			String tipoCtype = "";
			if (ctype.equals("xml")) {
				tipoCtype = "text/xml";
			} else {
				tipoCtype = "application/json";
			}

			String tipoAccept = "";
			if (accept.equals("xml")) {
				tipoAccept = "text/xml";
			} else {
				tipoAccept = "application/json";
			}
			
			//Recogemos los byte que tiene la cadena introducida en el appID
//			String idApp=appID.getText().toString()+":".toString();
//			byte[] cadenabyte = (idApp.getBytes());
//			//Codificamos los bytes recogidos anteriormente a Base64
//			String idAppB64 = Base64.encodeToString(cadenabyte, Base64.URL_SAFE|Base64.NO_WRAP);
			
			String idAppB64=Helper.encodeApp(appID.getText().toString(),hostName);
			
			HttpClient httpClient;
			
			HttpURLConnection http = null;
			
			httpClient = new DefaultHttpClient();
			HttpPut put = null;
			HttpPost post = null;
			String tipo=""; //Se usa para saber el tipo de conexion y poder coger la respuesta adecuada
			
			//if(oldToken.getText().toString().equals("")){			
				tipo="post";
				//httpClient = new DefaultHttpClient();
				//post = new HttpPost("http://bbvapush.dev.gobernalianet.org/users");
				//post = new HttpPost("http://pre.push.digitalservices.es/users");
				post = new HttpPost(host);
				
				
				post.setHeader("Authorization","Basic "+ idAppB64);
				post.setHeader("Content-Type", tipoCtype);
				post.setHeader("Accept", tipoAccept);
				
				String android_id = Secure.getString(getBaseContext().getContentResolver(),
                        Secure.ANDROID_ID); 
				
				String token_new = prefs.getString(PUSH_PREFERENCES_NAME_TOKEN_NEW, "");
				
		//hasta la version 0.4 inclusive
			if (Helper.HOSTNAME_WALLET.equals(hostName)){
				if (ctype.equals("json")) {
					String dato = "{"+
					"\"user\": {"+
						"\"userId\": \""+userID.getText().toString()+"\","+
						"\"platforms\": {	"+
						"\"android\": {"+
						"\"appVersion\": \"2.0\","+
						"\"token\": \""+token_new+"\","+
						"\"devicealias\": \""+alias.getText().toString()+"\","+
						"\"deviceid\": \""+android_id+"\""+												
						     "}" +
						   "}" +
						 "}" +
						"}" ;
	
					StringEntity entity;
					try {
						entity = new StringEntity(dato);
						post.setEntity(entity);
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				} else {
					String dato = "<user>"+
					   " <userId>"+userID.getText().toString()+"</userId>"+
					"<platforms>"+
					"<android>"+
					   " <appVersion>1.0</appVersion>"+
					    "<token>"+token_new+"</token>"+
					    "<devicealias>"+alias.getText().toString()+"</devicealias>"+
					    "<deviceid>"+android_id+"</deviceid>"+
					"</android>"+
					"</platforms>"+
					"</user>";
	
					StringEntity entity;
					try {
						entity = new StringEntity(dato);
						post.setEntity(entity);
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
			}}//a partir de la version 0.5
			else if (ctype.equals("json")) {
					String dato = "{"+
					"\"user\": {"+
						"\"id\": \""+userID.getText().toString()+"\","+
						"\"platforms\": {	"+
						"\"android\": {"+
						"\"appVersion\": \"2.0\","+
						"\"token\": \""+token_new+"\","+
						"\"alias\": \""+alias.getText().toString()+"\","+
						"\"id\": \""+android_id+"\""+												
						     "}" +
						   "}" +
						 "}" +
						"}" ;
	
					StringEntity entity;
					try {
						entity = new StringEntity(dato);
						post.setEntity(entity);
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				} else {
					String dato = "<user>"+
					   " <id>"+userID.getText().toString()+"</id>"+
					"<platforms>"+
					"<android>"+
					   " <appVersion>1.0</appVersion>"+
					    "<token>"+token_new+"</token>"+
					    "<alias>"+alias.getText().toString()+"</alias>"+
					    "<id>"+android_id+"</id>"+
					"</android>"+
					"</platforms>"+
					"</user>";
	
					StringEntity entity;
					try {
						entity = new StringEntity(dato);
						post.setEntity(entity);
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			/*}else{
				tipo="put";
				String encodeUserID = null;
				//Codificamos el userID para que no haya problemas con caracteres especiales o espacios
				try {
					 encodeUserID= URLEncoder.encode(userID.getText().toString(), "utf-8");
				} catch (UnsupportedEncodingException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
				//httpClient = new DefaultHttpClient();
				put = new HttpPut(
						"http://push.gobernalianet.es/users/"+encodeUserID);			
				
				put.setHeader("Authorization","Basic "+ idAppB64);
				put.setHeader("Content-Type", tipoCtype);
				put.setHeader("Accept", tipoAccept);
	
				if (ctype.equals("json")) {
					String dato = "{"+
							"\"user\":{"+
							"\"platforms\": {"+
								"\"android\": {"+
								"\"appVersion\": \"1.0\","+
								"\"token\": \""+actualToken.getText().toString()+"\","+
								"\"oldToken\": \""+oldToken.getText().toString()+"\""+
								"}"+
								"}"+
							"}" +
						"}";
	
					StringEntity entity;
					try {
						
						entity = new StringEntity(dato);
						put.setEntity(entity);
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				} else {
					String dato = "<user>"+
									"<platforms>"+
									"<android>"+
									    "<appVersion>1.0</appVersion>"+
									    "<token>"+actualToken.getText().toString()+"</token>"+
									    "<oldToken>"+oldToken.getText().toString()+"</oldToken>"+
									"</android>"+
									"</platforms>"+
									"</user>";
	
					StringEntity entity;
					try {
						entity = new StringEntity(dato);
						put.setEntity(entity);
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
				
			}*/

			

			
			HttpResponse resp;
			try {
				if(tipo.equals("post")){
					resp = httpClient.execute(post);
					respStr = EntityUtils.toString(resp.getEntity());
				}else{
					resp = httpClient.execute(put);
					respStr = EntityUtils.toString(resp.getEntity());
				}
			} catch (ClientProtocolException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			return respStr;
		}

		protected void onProgressUpdate(Float... valores) {

		}

		protected void onPostExecute(String respStr) {
			//Imprime todo el xml de respuesta:
			//final String ns = null;
			//XmlPullParser parser = Xml.newPullParser();
			//Log.v("XmlPullParser", "Parsing");
			
			consola.setText(respStr);
			
		}
	}
	
	
	@Override
	protected void onNewIntent(Intent intent) {	
		super.onNewIntent(intent);
		Log.v("GCMTest","testing");
	}
}