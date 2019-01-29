package mypackage;

import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.IPromise;
import org.nustaq.kontraktor.Promise;
import org.nustaq.kontraktor.annotations.CallerSideMethod;
import org.nustaq.kontraktor.remoting.base.ConnectableActor;
import org.nustaq.kontraktor.services.ServiceActor;
import org.nustaq.kontraktor.services.ServiceArgs;
import org.nustaq.kontraktor.services.ServiceDescription;
import org.nustaq.kontraktor.services.rlclient.DataClient;

import java.io.File;
import java.io.Serializable;

/**
 * used to hook webserver into rl cluster
 */
public class MyAppServerService extends ServiceActor<MyAppServerService> {

    private MyAppServer webServer;

    public static MyAppServerService start(String[] args) {
        if ( ! new File("run/etc").exists() ) {
            System.out.println("Please start with working dir project root");
            System.exit(1);
        }
        return (MyAppServerService) ServiceActor.RunTCP(args,MyAppServerService.class,ServiceArgs.class);
    }

    @Override
    public IPromise init(ConnectableActor registryConnectable, ServiceArgs options, boolean autoRegister) {
        Promise p = new Promise();
        super.init(registryConnectable, options, autoRegister).then( (e,r) -> {
//            ClusterAPIs.initAPIs(getDClient());
            p.resolve();
        });
        return p;
    }

    @CallerSideMethod
    public DataClient getDClient() {
        return getActor().dclient;
    }

    protected String[] getRequiredServiceNames() {
        return new String[] {};
    }

    @Override
    protected ServiceDescription createServiceDescription() {
        return new ServiceDescription("WebApp");
    }

    public void setWebServer(MyAppServer self) {
        this.webServer = self;
    }
}
