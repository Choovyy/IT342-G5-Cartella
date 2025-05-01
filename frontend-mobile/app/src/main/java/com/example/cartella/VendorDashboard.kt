package com.example.cartella

import android.content.SharedPreferences
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.TextView

class VendorDashboard : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.vendor_dashboard)

        val sharedPref = getSharedPreferences("CartellaPref", MODE_PRIVATE)
        findViewById<TextView>(R.id.textViewWelcome).text = "Vendor: ${sharedPref.getString("username", "Vendor")}"
    }
}