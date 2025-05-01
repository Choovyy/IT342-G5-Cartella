package com.example.cartella

import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

class Register : AppCompatActivity() {

    private lateinit var usernameEdit: EditText
    private lateinit var emailEdit: EditText
    private lateinit var passwordEdit: EditText
    private lateinit var numberEdit: EditText
    private lateinit var signUpButton: Button
    private lateinit var loginLink: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.register)

        usernameEdit = findViewById(R.id.editTextUsername)
        emailEdit = findViewById(R.id.editTextEmail)
        passwordEdit = findViewById(R.id.editTextPassword)
        numberEdit = findViewById(R.id.editTextNumber)
        signUpButton = findViewById(R.id.btnSignUp)
        loginLink = findViewById(R.id.bottomLinks)

        signUpButton.setOnClickListener {
            registerUser()
        }

        loginLink.setOnClickListener {
            startActivity(Intent(this, Login::class.java))
            finish()
        }
    }

    private fun registerUser() {
        val username = usernameEdit.text.toString().trim()
        val email = emailEdit.text.toString().trim()
        val password = passwordEdit.text.toString().trim()
        val phone = numberEdit.text.toString().trim()

        if (username.isEmpty() || email.isEmpty() || password.isEmpty() || phone.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        val request = RegisterRequest(username, email, password, phone)

        RetrofitClient.instance.registerUser(request).enqueue(object : Callback<RegisterResponse> {
            override fun onResponse(call: Call<RegisterResponse>, response: Response<RegisterResponse>) {
                if (response.isSuccessful && response.body() != null) {
                    Toast.makeText(this@Register, "Registered successfully", Toast.LENGTH_LONG).show()
                    startActivity(Intent(this@Register, Login::class.java))
                    finish()
                } else {
                    Toast.makeText(this@Register, "Registration failed", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<RegisterResponse>, t: Throwable) {
                Toast.makeText(this@Register, "Error: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    // Inner class for RegisterRequest
    data class RegisterRequest(
        val username: String,
        val email: String,
        val password: String,
        val phone: String
    )

    // Inner class for RegisterResponse
    data class RegisterResponse(
        val message: String
    )

    // Retrofit client object for making API calls
    object RetrofitClient {
        private const val BASE_URL = "https://it342-g5-cartella.onrender.com"

        val instance: ApiService by lazy {
            val retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            retrofit.create(ApiService::class.java)
        }
    }

    // Define your API service interface here
    interface ApiService {
        @POST("api/register")
        fun registerUser(@Body request: RegisterRequest): Call<RegisterResponse>
    }
}
