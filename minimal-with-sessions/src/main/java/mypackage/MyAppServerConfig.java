package mypackage;

import org.nustaq.kontraktor.util.Log;
import org.nustaq.kson.Kson;

import java.io.File;
import java.io.Serializable;

public class MyAppServerConfig implements Serializable {

    int bindPort = 8088;
    String publicUrl = "http://localhost:"+bindPort;
    String bindIp = "0.0.0.0";
    boolean devMode = false;
    int numSessionThreads = 2;
    int sessionTimeoutMinutes = 10;

    public boolean isDevMode() {
        return devMode;
    }

    public static MyAppServerConfig read(String pathname) {
        Kson kson = new Kson().map(
            MyAppServerConfig.class
        );
        try {
            MyAppServerConfig juptrCfg = (MyAppServerConfig) kson.readObject(new File(pathname));
            String confString = kson.writeObject(juptrCfg);
            System.out.println("run with config from "+ new File(pathname).getCanonicalPath());
            System.out.println(confString);
            return juptrCfg;
        } catch (Exception e) {
            Log.Warn(null, pathname + " not found or parse error. " + e.getClass().getSimpleName() + ":" + e.getMessage());
            try {
                String sampleconf = kson.writeObject(new MyAppServerConfig());
                System.out.println("Defaulting to:\n"+sampleconf);
            } catch (Exception e1) {
                e1.printStackTrace();
            }
        }
        return new MyAppServerConfig();
    }

    public MyAppServerConfig() {
    }

    public int getNumSessionThreads() {
        return numSessionThreads;
    }

    public int getSessionTimeoutMinutes() {
        return sessionTimeoutMinutes;
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
