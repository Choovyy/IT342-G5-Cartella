package com.example.cartella

import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.io.*
import java.net.HttpURLConnection
import java.net.URL

class Register : AppCompatActivity() {

    private lateinit var registerBtn: Button
    private lateinit var editTextUsername: EditText
    private lateinit var editTextEmail: EditText
    private lateinit var editTextPassword: EditText
    private lateinit var editTextNumber: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.register)

        // Bind views
        registerBtn = findViewById(R.id.btnSignUp)
        editTextUsername = findViewById(R.id.editTextUsername)
        editTextEmail = findViewById(R.id.editTextEmail)
        editTextPassword = findViewById(R.id.editTextPassword)
        editTextNumber = findViewById(R.id.editTextNumber)

        // Set button click listener
        registerBtn.setOnClickListener {
            val username = editTextUsername.text.toString()
            val email = editTextEmail.text.toString()
            val password = editTextPassword.text.toString()
            val phoneNumber = editTextNumber.text.toString()

            // Validate fields before making request
            if (username.isEmpty() || email.isEmpty() || password.isEmpty() || phoneNumber.isEmpty()) {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Make the network request
            registerUser(username, email, password, phoneNumber)
        }
    }

    private fun registerUser(username: String, email: String, password: String, phoneNumber: String) {
        // Run network operation in a separate thread to avoid blocking the UI
        Thread {
            try {
                // Prepare the URL for the registration API
                val url = URL("https://it342-g5-cartella.onrender.com/api/users/register")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true

                // Prepare JSON body with the registration data
                val jsonBody = """
                    {
                        "username": "$username",
                        "email": "$email",
                        "password": "$password",
                        "phone_number": "$phoneNumber"
                    }
                """.trimIndent()

                // Send JSON body to the server
                val outputStream: OutputStream = conn.outputStream
                val writer = BufferedWriter(OutputStreamWriter(outputStream, "UTF-8"))
                writer.write(jsonBody)
                writer.flush()
                writer.close()
                outputStream.close()

                // Get the response code to determine success or failure
                val responseCode = conn.responseCode

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    // Successfully registered, handle the response if needed
                    val response = conn.inputStream.bufferedReader().readText()

                    // Switch back to the main UI thread to update the UI
                    runOnUiThread {
                        Toast.makeText(this, "Registration Successful", Toast.LENGTH_SHORT).show()
                        // Optionally, redirect to login or next activity
                    }
                } else {
                    // Handle error response
                    runOnUiThread {
                        Toast.makeText(this, "Registration Failed", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                // Handle exception and show error
                runOnUiThread {
                    Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }.start() // Start the network thread
    }
}

