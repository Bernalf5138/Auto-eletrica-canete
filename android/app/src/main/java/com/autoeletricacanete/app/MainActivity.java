package com.autoeletricacanete.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int CAMERA_PERMISSION_CODE = 101;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ensure the webview never overlaps Android navigation buttons or gestures
        androidx.core.view.WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

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
}
