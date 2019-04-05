package mypackage.server;

import org.nustaq.kontraktor.services.ClusterCfg;
import org.nustaq.kontraktor.services.ServiceRegistry;
import org.nustaq.kontraktor.services.rlclient.DataShard;

import java.io.File;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Development startup: run Serviceregistry and DataShards in a single process
 */
public class MyAppDataClusterStartup {

    public static void main(String[] args) throws InterruptedException {
        if ( ! new File("run/etc").exists() ) {
            System.out.println("Please start with working dir [project]");
            System.exit(1);
        }

        // start Registry
        ServiceRegistry.main( new String[] { "-sp", ""+5678, "-monitorport", "8082", "-dsPortBase", ""+31000 });
        Thread.sleep(1000);

        Executor ex = Executors.newCachedThreadPool();
        // Start Data Shards
        ClusterCfg cfg = ClusterCfg.read();
        for ( int i = 0; i < cfg.getDataCluster().getNumberOfShards(); i++ ) {
            final int finalI = i;
            ex.execute(() -> DataShard.main(new String[]{  "-sp", ""+5678, "-monitorport", "8082", "-host", "localhost", "-shardNo", ""+ finalI, "-dsPortBase", ""+31000 }));
        }
    }

}
