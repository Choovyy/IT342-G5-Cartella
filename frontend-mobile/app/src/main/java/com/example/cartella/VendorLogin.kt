package com.example.cartella

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

class VendorLogin : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.vendor_login)

        findViewById<android.widget.Button>(R.id.btnSignUp).setOnClickListener {
            val username = findViewById<android.widget.EditText>(R.id.editTextUsername).text.toString()
            val password = findViewById<android.widget.EditText>(R.id.editTextPassword).text.toString()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill in both username and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val loginRequest = LoginRequest(username, password)
            performLogin(loginRequest)
        }
    }

    private fun performLogin(loginRequest: LoginRequest) {
        RetrofitClient.instance.vendorLogin(loginRequest).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful) {
                    val loginResponse = response.body()

                    if (loginResponse != null) {
                        val token = loginResponse.token
                        JwtUtil.saveJwtToken(applicationContext, token) // Save JWT token in shared preferences

                        // Show success message
                        Toast.makeText(this@VendorLogin, "Login successful", Toast.LENGTH_SHORT).show()

                        // Navigate to the vendor dashboard
                        val intent = Intent(this@VendorLogin, VendorDashboard::class.java)
                        intent.putExtra("userId", loginResponse.userId)
                        intent.putExtra("vendorId", loginResponse.vendorId)
                        intent.putExtra("businessName", loginResponse.businessName)
                        startActivity(intent)

                        finish()
                    } else {
                        Toast.makeText(this@VendorLogin, "Login failed: No response data", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@VendorLogin, "Login failed: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                Toast.makeText(this@VendorLogin, "Login failed: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    // JWT Utility for token management
    object JwtUtil {
        private const val PREFS_NAME = "CartellaPrefs"
        private const val JWT_TOKEN_KEY = "jwt_token"

        fun saveJwtToken(context: Context, token: String) {
            val sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val editor = sharedPreferences.edit()
            editor.putString(JWT_TOKEN_KEY, token)
            editor.apply()
        }

        fun getJwtToken(context: Context): String? {
            val sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return sharedPreferences.getString(JWT_TOKEN_KEY, null)
        }

        fun clearJwtToken(context: Context) {
            val sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val editor = sharedPreferences.edit()
            editor.remove(JWT_TOKEN_KEY)
            editor.apply()
        }
    }

    // Data classes for login request and response
    data class LoginRequest(
        val username: String,
        val password: String
    )

    data class LoginResponse(
        val token: String,  // JWT token
        val userId: Long,
        val vendorId: Long,
        val businessName: String,
        val joinedDate: String,
        val message: String
    )

    // Retrofit service interface for API calls
    interface ApiService {
        @POST("api/vendor/login")
        fun vendorLogin(@Body request: LoginRequest): Call<LoginResponse>
    }

    // Retrofit client for API communication
    object RetrofitClient {
        private const val BASE_URL = "https://it342-g5-cartella.onrender.com/"

        val instance: ApiService by lazy {
            val retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            retrofit.create(ApiService::class.java)
        }
    }
    }