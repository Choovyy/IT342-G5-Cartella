package com.example.cartella

import android.annotation.SuppressLint
import android.content.SharedPreferences
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.TextView

class Dashboard : AppCompatActivity() {
    @SuppressLint("MissingInflatedId")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dashboard)

        val sharedPref = getSharedPreferences("CartellaPref", MODE_PRIVATE)
        findViewById<TextView>(R.id.textViewWelcome).text = "Welcome, ${sharedPref.getString("username", "User")}!"
    }
}