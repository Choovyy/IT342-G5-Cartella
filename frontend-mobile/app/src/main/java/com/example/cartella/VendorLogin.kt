package com.example.cartella

import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.io.*
import java.net.HttpURLConnection
import java.net.URL

class VendorLogin : AppCompatActivity() {

    private lateinit var usernameField: EditText
    private lateinit var passwordField: EditText
    private lateinit var loginButton: Button
    private lateinit var goToRegister: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.vendor_login) // make sure you create vendor_login.xml layout

        usernameField = findViewById(R.id.editTextUsername)
        passwordField = findViewById(R.id.editTextPassword)
        loginButton = findViewById(R.id.btnSignUp)
        goToRegister = findViewById(R.id.bottomLinks)

        loginButton.setOnClickListener {
            val username = usernameField.text.toString().trim()
            val password = passwordField.text.toString().trim()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
            } else {
                loginVendor(username, password)
            }
        }

        goToRegister.setOnClickListener {
            startActivity(Intent(this, VendorRegister::class.java)) // you’ll implement this next
        }
    }

    private fun loginVendor(username: String, password: String) {
        Thread {
            try {
                val url = URL("https://it342-g5-cartella.onrender.com/api/vendors/login")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true

                val json = JSONObject()
                json.put("username", username)
                json.put("password", password)

                BufferedWriter(OutputStreamWriter(conn.outputStream)).use {
                    it.write(json.toString())
                    it.flush()
                }

                val responseCode = conn.responseCode
                val responseText = if (responseCode == HttpURLConnection.HTTP_OK) {
                    conn.inputStream.bufferedReader().readText()
                } else {
                    conn.errorStream?.bufferedReader()?.readText() ?: "Unknown error"
                }

                runOnUiThread {
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        Toast.makeText(this, "Vendor login successful", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this, VendorDashboard::class.java)) // create this
                        finish()
                    } else {
                        Toast.makeText(this, "Login failed: $responseText", Toast.LENGTH_LONG).show()
                    }
                }

            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }.start()
    }
}
