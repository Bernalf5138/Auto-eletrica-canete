package com.autoeletricacanete.app;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "NativeUpdater")
public class NativeUpdaterPlugin extends Plugin {

    @PluginMethod
    public void startUpdate(final PluginCall call) {
        final String url = call.getString("url");
        if (url == null || url.trim().isEmpty()) {
            call.reject("URL no válida");
            return;
        }

        final Context context = getContext();
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    // Check unknown app sources permission on Android 8+
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        if (!context.getPackageManager().canRequestPackageInstalls()) {
                            Toast.makeText(context, "Por favor autorice la instalación para actualizar.", Toast.LENGTH_LONG).show();
                            Intent allowIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + context.getPackageName()));
                            allowIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            context.startActivity(allowIntent);
                        }
                    }

                    Toast.makeText(context, "Descargando actualización en segundo plano...", Toast.LENGTH_LONG).show();

                    File dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    if (dir != null && !dir.exists()) {
                        dir.mkdirs();
                    }
                    final File targetApk = new File(dir, "Auto_Electrica_Canete_update.apk");
                    if (targetApk.exists()) {
                        targetApk.delete();
                    }

                    DownloadManager dm = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
                    if (dm == null) {
                        call.reject("DownloadManager no disponible");
                        return;
                    }

                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    request.setTitle("Auto Eléctrica Cañete");
                    request.setDescription("Descargando nueva versión...");
                    request.setDestinationInExternalFilesDir(context, Environment.DIRECTORY_DOWNLOADS, "Auto_Electrica_Canete_update.apk");
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    request.setAllowedOverMetered(true);
                    request.setAllowedOverRoaming(true);

                    final long downloadId = dm.enqueue(request);

                    BroadcastReceiver receiver = new BroadcastReceiver() {
                        @Override
                        public void onReceive(Context ctx, Intent intent) {
                            long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                            if (id == downloadId) {
                                try {
                                    context.unregisterReceiver(this);
                                } catch (Exception ignored) {}

                                installApk(context, targetApk);
                            }
                        }
                    };

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        context.registerReceiver(receiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED);
                    } else {
                        context.registerReceiver(receiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
                    }

                    JSObject ret = new JSObject();
                    ret.put("status", "downloading");
                    call.resolve(ret);

                } catch (Exception e) {
                    Toast.makeText(context, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
                    call.reject(e.getMessage());
                }
            }
        });
    }

    private void installApk(Context context, File apkFile) {
        try {
            if (!apkFile.exists()) {
                Toast.makeText(context, "Archivo descargado no encontrado", Toast.LENGTH_SHORT).show();
                return;
            }

            Uri apkUri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", apkFile);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(context, "Error al abrir instalador: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
}
