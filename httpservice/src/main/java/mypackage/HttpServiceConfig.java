package mypackage;

import org.nustaq.kontraktor.util.Log;
import org.nustaq.kson.Kson;

import java.io.File;
import java.io.Serializable;

public class HttpServiceConfig implements Serializable {

    int bindPort = 8090;
    String publicUrl = "ws://localhost:"+bindPort;
    String bindIp = "0.0.0.0";

    public static HttpServiceConfig read(String pathname) {
        Kson kson = new Kson().map(
            HttpServiceConfig.class
        );
        try {
            HttpServiceConfig juptrCfg = (HttpServiceConfig) kson.readObject(new File(pathname));
            String confString = kson.writeObject(juptrCfg);
            Log.Info(HttpServiceConfig.class,"run with config from "+ new File(pathname).getCanonicalPath());
            Log.Info(HttpServiceConfig.class,confString);
            return juptrCfg;
        } catch (Exception e) {
            Log.Warn(null, pathname + " not found or parse error. " + e.getClass().getSimpleName() + ":" + e.getMessage());
            try {
                String sampleconf = kson.writeObject(new HttpServiceConfig());
                Log.Info(HttpServiceConfig.class,"Defaulting to:\n"+sampleconf);
            } catch (Exception e1) {
                e1.printStackTrace();
            }
        }
        return new HttpServiceConfig();
    }

    public int getBindPort() {
        return bindPort;
    }

    public String getPublicUrl() {
        return publicUrl;
    }

    public String getBindIp() {
        return bindIp;
    }
}
