package com.example.speech;

import java.security.cert.CertificateException;


import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.security.cert.X509Certificate;

import android.util.Base64;

public class Helper {

	public static final String HOSTNAME_PRE="PRE";
	public static final String HOSTNAME_PRO="PRO";
	public static final String HOSTNAME_SANDBOX="SANDBOX";
	public static final String HOSTNAME_WALLET="WALLET";
	public static final String HOSTNAME_DEV="DEV";
	
	public static String IDSENDER_MAYA_KEY = "785633617966";
	public static String IDSENDER_BAAS_KEY="372918508666";
	public static String IDSENDER_WALLET_KEY="897416372755";
	public static String IDSENDER_PENSIONS_KEY="738041637545";
	//public static String IDSENDER_ANDROID_KEY = IDSENDER_MAYA_KEY;        //Sender ID:  IDSENDER_BAAS_KEY;
	public static String IDSENDER_ANDROID_KEY =  IDSENDER_BAAS_KEY;
	
	public static final String[] datosHost = new String[] {HOSTNAME_PRE, HOSTNAME_PRO,HOSTNAME_SANDBOX,HOSTNAME_DEV,HOSTNAME_WALLET};
	//public static final String[] datosHost = new String[] {HOSTNAME_PRO};

	 private static String HOST_DEV= "http://bbvapush.dev.gobernalianet.org";
	 private static String HOST_PRE= "http://pre.push.digitalservices.es";
	 private static String HOST_SANDBOX= "https://sandbox.digitalservices.es/notifier";
	 private static String HOST_WALLET= "http://wallet.push.digitalservices.es";
	 //private static String HOST_WALLET= "http://push.gobernalianet.es/users";
	 private static String HOST_PRO= "https://api.bbva.com/notifier";
	 private static String HOSTNAME_DEFAULT= HOST_DEV;
	 public static String DEFAULT_APPID= "com.bbva.baas.notifier.test";
	 
	 public static String BASS_KEY= "6dc636e046d9613d5889a62b4626a40628153a49";
	 //public static String MAYA_KEY="AIzaSyCHDWV2x32I7OYJ0eiIkES3W8SqshU2HDk"; // API Key for Server apps 
	 //public static String MAYA_KEY="AIzaSyDG2f_OHoXVeiYLuDdKhe8PtO4mzapg7h0"; // API Key for android apps 
	 
	public static String DEFAULT_KEY = BASS_KEY; //MAYA_KEY;
	 
	 public static String[] getHostsAvailables(){
		 
		 return datosHost;
	 }
	 
	 public static String getDefaultHost(){
		 return HOSTNAME_DEFAULT;
	 }
	 
	 public static String getHost(String hostSelected){
		 String host="";
		 if (HOSTNAME_PRE.equals(hostSelected)){
				host=HOST_PRE;
			}else if (HOSTNAME_PRO.equals(hostSelected)){
				host=HOST_PRO;
			}else if (HOSTNAME_DEV.equals(hostSelected)){
				host=HOST_DEV;
			}else if (HOSTNAME_SANDBOX.equals(hostSelected)){
				host=HOST_SANDBOX;
			}else if (HOSTNAME_WALLET.equals(hostSelected)){
				host=HOST_WALLET;
			}
		 
		 return host;
	 }
	 
	 
	 /**
	  * Trust every server - dont check for any certificate
	  */
	 static void trustAllHosts() {
	 	// Create a trust manager that does not validate certificate chains
	 	TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
	 		public java.security.cert.X509Certificate[] getAcceptedIssuers() {
	 			return new java.security.cert.X509Certificate[] {};
	 		}

	 		public void checkClientTrusted(X509Certificate[] chain,
	 				String authType) throws CertificateException {
	 		}

	 		public void checkServerTrusted(X509Certificate[] chain,
	 				String authType) throws CertificateException {
	 		}

			@Override
			public void checkClientTrusted(
					java.security.cert.X509Certificate[] chain, String authType)
					throws CertificateException {
				// TODO Auto-generated method stub
				
			}

			@Override
			public void checkServerTrusted(
					java.security.cert.X509Certificate[] chain, String authType)
					throws CertificateException {
				// TODO Auto-generated method stub
				
			}
	 	} };

	 	// Install the all-trusting trust manager
	 	try {
	 		SSLContext sc = SSLContext.getInstance("TLS");
	 		sc.init(null, trustAllCerts, new java.security.SecureRandom());
	 		HttpsURLConnection
	 				.setDefaultSSLSocketFactory(sc.getSocketFactory());
	 	} catch (Exception e) {
	 		e.printStackTrace();
	 	}
	 }
	 
	 
	 /**
	  * convert the application id introduced by input method to api manager's key
	  * @param appId
	  * @return
	  */
	 public static String  encodeApp(String appId,String host) {
		 
		 
		//Recogemos los byte que tiene la cadena introducida en el appID
		 
		 Boolean putApikey=false;
		 
		 if (HOSTNAME_PRE.equals(host)){
				
			}else if (HOSTNAME_PRO.equals(host)){
				putApikey=true;
			}else if (HOSTNAME_DEV.equals(host)){
				
			}else if (HOSTNAME_SANDBOX.equals(host)){
				putApikey=true;
			}else if (HOSTNAME_WALLET.equals(host)){
				
			}
			String idApp=appId+":";
			
			if (putApikey){
				idApp=idApp+DEFAULT_KEY;
			}
			
			byte[] cadenabyte = (idApp.getBytes());
			//Codificamos los bytes recogidos anteriormente a Base64
			String idAppB64 = Base64.encodeToString(cadenabyte, Base64.URL_SAFE|Base64.NO_WRAP);
		    
		 return idAppB64;
	 }
	
}


