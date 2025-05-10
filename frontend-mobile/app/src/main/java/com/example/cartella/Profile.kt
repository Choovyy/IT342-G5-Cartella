package com.example.cartella

import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class Profile : AppCompatActivity() {

    private lateinit var nameText: TextView
    private lateinit var emailText: TextView
    private lateinit var phoneText: TextView
    private lateinit var dobText: TextView
    private lateinit var genderText: TextView
    private lateinit var logoutButton: Button

    private val sharedPref by lazy { getSharedPreferences("CartellaPrefs", MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.profile)

        nameText = findViewById(R.id.textName)
        emailText = findViewById(R.id.textEmail)
        phoneText = findViewById(R.id.textPhone)
        dobText = findViewById(R.id.textDob)
        genderText = findViewById(R.id.textGender)
        logoutButton = findViewById(R.id.btnLogout)

        val token = sharedPref.getString("token", null)
        val userId = sharedPref.getLong("userId", -1)

        if (token == null || userId == -1L) {
            Toast.makeText(this, "Not logged in", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, Login::class.java)) // redirect to buyer login
            finish()
            return
        }

        fetchUserProfile(userId, token)

        logoutButton.setOnClickListener {
            sharedPref.edit().clear().apply()
            startActivity(Intent(this, Login::class.java))
            finish()
        }
    }

    private fun fetchUserProfile(userId: Long, token: String) {
        Thread {
            try {
                val url = URL("https://it342-g5-cartella.onrender.com/api/users/$userId")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "GET"
                conn.setRequestProperty("Authorization", "Bearer $token")

                val responseCode = conn.responseCode
                val responseText = if (responseCode == 200) {
                    conn.inputStream.bufferedReader().readText()
                } else {
                    conn.errorStream?.bufferedReader()?.readText() ?: "Error"
                }

                if (responseCode == 200) {
                    val json = JSONObject(responseText)
                    runOnUiThread {
                        nameText.text = json.getString("username")
                        emailText.text = json.getString("email")
                        phoneText.text = json.optString("phoneNumber", "N/A")
                        dobText.text = json.optString("dateOfBirth", "N/A")
                        genderText.text = json.optString("gender", "N/A")
                    }
                } else {
                    runOnUiThread {
                        Toast.makeText(this, "Failed to load profile", Toast.LENGTH_LONG).show()
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
