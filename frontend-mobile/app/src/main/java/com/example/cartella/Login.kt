package com.example.cartella

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class Login : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login)

        val loginButton = findViewById<Button>(R.id.btnSignUp)
        val googleButton = findViewById<Button>(R.id.btnGoogle)
        val registerLink = findViewById<TextView>(R.id.bottomLinks)

        loginButton.setOnClickListener {
            // Temporarily skip login and go directly to Dashboard
            startActivity(Intent(this, Dashboard::class.java))
            finish()
        }

        googleButton.setOnClickListener {
            // Temporarily skip Google login and go directly to Dashboard
            startActivity(Intent(this, Dashboard::class.java))
            finish()
        }

        registerLink.setOnClickListener {
            // Go to Register screen
            startActivity(Intent(this, Register::class.java))
        }
    }
}
