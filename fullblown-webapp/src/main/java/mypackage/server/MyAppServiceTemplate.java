package mypackage.server;

import org.nustaq.kontraktor.IPromise;
import org.nustaq.kontraktor.Promise;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.remoting.base.ConnectableActor;
import org.nustaq.kontraktor.services.ServiceActor;
import org.nustaq.kontraktor.services.ServiceArgs;
import org.nustaq.kontraktor.services.ServiceDescription;
import org.nustaq.kontraktor.util.Log;
import org.nustaq.reallive.api.RealLiveTable;
import org.nustaq.reallive.api.Subscriber;
import org.nustaq.reallive.records.MapRecord;

import java.io.File;

public class MyAppServiceTemplate extends ServiceActor<MyAppServiceTemplate> {

    MyAppServiceTemplateArgs options;

    public static void main(String[] args) {
        if ( ! new File("run/etc").exists() ) {
            System.out.println("Please start with working dir [project]");
            System.exit(1);
        }
        ServiceActor.RunTCP(args,MyAppServiceTemplate.class,MyAppServiceTemplateArgs.class);
    }

    @Override
    public IPromise init(ConnectableActor gravityConnectable, ServiceArgs options, boolean autoRegister) {
        Promise p = new Promise();
        this.options = (MyAppServiceTemplateArgs) options;
        super.init(gravityConnectable, options, autoRegister)
            .then( (res,err) -> {
                Log.Info(this,"init finished");
                p.complete(res,err);
                self().someTest();
            });
        return p;
    }

    @Local
    public void someTest() {
        RealLiveTable ulTable = dclient.tbl("usagelog");

        Subscriber subs = new Subscriber(rec -> true, change -> Log.Info(this, "ALL:" + change));
        ulTable.subscribe(subs);

        Subscriber filtered = new Subscriber(rec -> rec.getKey().indexOf("oo") >= 0, change -> Log.Info(this, "FLT:" + change));
        ulTable.subscribe(filtered);

        Subscriber safe = ulTable.subscribeOn("xy == 13", change -> Log.Info(this,"SAF:"+change));

        delayed(1000, () -> {
            ulTable.remove("helloo");
            ulTable.put("samplerec", "key", "Value");
            ulTable.addRecord(
                MapRecord.New("helloo")
                    .put("xy","xyvalue")
            );
            ulTable.update("helloo","xy",13);

            ulTable.query("xy == 13", (rec,err) -> Log.Info(this,"QRY:"+rec+" "+err));
        });
    }

    @Override
    protected String[] getRequiredServiceNames() {
        return new String[] {};
    }

    @Override
    protected ServiceDescription createServiceDescription() {
        return new ServiceDescription("MyAppServiceTemplate");
    }
}
