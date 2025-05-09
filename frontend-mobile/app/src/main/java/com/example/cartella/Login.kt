package com.example.cartella

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent
import org.json.JSONObject
import java.io.*
import java.net.HttpURLConnection
import java.net.URL

class Login : AppCompatActivity() {

    private lateinit var emailField: EditText
    private lateinit var passwordField: EditText
    private lateinit var loginBtn: Button
    private lateinit var goToRegisterBtn: TextView
    private lateinit var googleLoginBtn: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login)

        emailField = findViewById(R.id.editTextUsername)
        passwordField = findViewById(R.id.editTextPassword)
        loginBtn = findViewById(R.id.btnSignUp)
        goToRegisterBtn = findViewById(R.id.bottomLinks)
        googleLoginBtn = findViewById(R.id.btnGoogle)

        loginBtn.setOnClickListener {
            val email = emailField.text.toString().trim()
            val password = passwordField.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter both email and password", Toast.LENGTH_SHORT).show()
            } else {
                loginUser(email, password)
            }
        }

        goToRegisterBtn.setOnClickListener {
            startActivity(Intent(this, Register::class.java))
        }

        googleLoginBtn.setOnClickListener {
            val authUri = Uri.parse("https://it342-g5-cartella.onrender.com/oauth2/authorization/google")
            val customTabsIntent = CustomTabsIntent.Builder().build()
            customTabsIntent.launchUrl(this, authUri)
        }

        // Handle redirect if activity is started by a URI
        intent?.data?.let { handleOAuthRedirect(it) }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.data?.let { handleOAuthRedirect(it) }
    }

    private fun handleOAuthRedirect(uri: Uri) {
        if (uri.toString().startsWith("cartella://oauth2/redirect")) {
            val token = uri.getQueryParameter("token")
            if (token != null) {
                Toast.makeText(this, "Google login successful", Toast.LENGTH_SHORT).show()
                // Optional: Save token to SharedPreferences if needed
                startActivity(Intent(this, Dashboard::class.java))
                finish()
            } else {
                Toast.makeText(this, "Failed to get token", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun loginUser(email: String, password: String) {
        Thread {
            try {
                val url = URL("https://it342-g5-cartella.onrender.com/api/users/login")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true

                val jsonBody = JSONObject()
                jsonBody.put("username", email)
                jsonBody.put("password", password)

                val outputWriter = BufferedWriter(OutputStreamWriter(conn.outputStream, "UTF-8"))
                outputWriter.write(jsonBody.toString())
                outputWriter.flush()
                outputWriter.close()

                val responseCode = conn.responseCode
                val response = if (responseCode == HttpURLConnection.HTTP_OK) {
                    conn.inputStream.bufferedReader().readText()
                } else {
                    conn.errorStream?.bufferedReader()?.readText() ?: "Unknown error"
                }

                runOnUiThread {
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        Toast.makeText(this, "Login successful", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this, Dashboard::class.java))
                        finish()
                    } else {
                        Toast.makeText(this, "Login failed: $response", Toast.LENGTH_LONG).show()
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
