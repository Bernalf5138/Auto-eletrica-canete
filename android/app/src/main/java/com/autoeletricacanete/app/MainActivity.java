package com.autoeletricacanete.app;

import android.Manifest;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;

public class MainActivity extends BridgeActivity {
    private static final int CAMERA_PERMISSION_CODE = 101;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ensure the webview never overlaps Android navigation buttons or gestures
        androidx.core.view.WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // Register NativeUpdater JavaScript Interface for direct In-App APK Download & Install
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().addJavascriptInterface(new NativeUpdaterInterface(), "NativeUpdater");
        }

        // Pedir permiso de cámara inmediatamente al abrir la aplicación
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                new String[]{
                    Manifest.permission.CAMERA
                },
                CAMERA_PERMISSION_CODE
            );
        }
    }

    public class NativeUpdaterInterface {
        @JavascriptInterface
        public void startUpdate(final String url) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    downloadAndInstallApk(url);
                }
            });
        }
    }

    private void downloadAndInstallApk(String url) {
        try {
            if (url == null || url.trim().isEmpty()) {
                Toast.makeText(this, "Enlace de descarga no válido.", Toast.LENGTH_SHORT).show();
                return;
            }

            // Check permission to install packages on Android 8+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!getPackageManager().canRequestPackageInstalls()) {
                    Toast.makeText(this, "Por favor autorice la instalación de la actualización.", Toast.LENGTH_LONG).show();
                    Intent allowIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()));
                    allowIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(allowIntent);
                }
            }

            Toast.makeText(this, "Descargando actualización en segundo plano...", Toast.LENGTH_SHORT).show();

            File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            if (dir != null && !dir.exists()) {
                dir.mkdirs();
            }
            final File targetApk = new File(dir, "Auto_Electrica_Canete_update.apk");
            if (targetApk.exists()) {
                targetApk.delete();
            }

            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (dm == null) {
                Toast.makeText(this, "Administrador de descargas no disponible.", Toast.LENGTH_SHORT).show();
                return;
            }

            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle("Auto Eléctrica Cañete");
            request.setDescription("Descargando actualización...");
            request.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, "Auto_Electrica_Canete_update.apk");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(true);

            final long downloadId = dm.enqueue(request);

            BroadcastReceiver receiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                    if (id == downloadId) {
                        try {
                            unregisterReceiver(this);
                        } catch (Exception ignored) {}

                        installApk(targetApk);
                    }
                }
            };

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(receiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED);
            } else {
                registerReceiver(receiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
            }

        } catch (Exception e) {
            Toast.makeText(this, "Error al iniciar descarga: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void installApk(File apkFile) {
        try {
            if (!apkFile.exists()) {
                Toast.makeText(this, "Archivo no encontrado.", Toast.LENGTH_SHORT).show();
                return;
            }

            Uri apkUri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", apkFile);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(this, "Error al abrir instalador: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
}
