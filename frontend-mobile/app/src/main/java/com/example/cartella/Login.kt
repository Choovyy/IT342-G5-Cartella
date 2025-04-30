package com.example.cartella

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

class Login : AppCompatActivity() {

    private lateinit var googleSignInClient: GoogleSignInClient
    private val RC_SIGN_IN = 9001
    private lateinit var apiService: ApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login)

        // Initialize Retrofit for API communication
        val retrofit = Retrofit.Builder()
            .baseUrl("https://your-api-base-url.com/") // Replace with your actual API URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        apiService = retrofit.create(ApiService::class.java)

        // Configure Google Sign In
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()

        googleSignInClient = GoogleSignIn.getClient(this, gso)

        // Regular login button
        val loginButton = findViewById<Button>(R.id.btnSignUp)
        val usernameEditText = findViewById<EditText>(R.id.editTextUsername)
        val passwordEditText = findViewById<EditText>(R.id.editTextPassword)

        loginButton.setOnClickListener {
            val username = usernameEditText.text.toString()
            val password = passwordEditText.text.toString()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Sign in with email/username and password
            signInWithCredentials(username, password)
        }

        // Google Sign-In button
        val googleButton = findViewById<Button>(R.id.btnGoogle)
        googleButton.setOnClickListener {
            signInWithGoogle()
        }

        // Navigate to Register screen
        val bottomLinks = findViewById<TextView>(R.id.bottomLinks)
        bottomLinks.setOnClickListener {
            startActivity(Intent(this, Register::class.java))
        }
    }

    private fun signInWithCredentials(username: String, password: String) {
        val loginRequest = LoginRequest(username, password)

        apiService.login(loginRequest).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful && response.body() != null) {
                    val loginResponse = response.body()!!

                    // Save the auth token to shared preferences
                    val sharedPref = getSharedPreferences("CartellaPref", MODE_PRIVATE)
                    with(sharedPref.edit()) {
                        putString("auth_token", loginResponse.token)
                        putString("user_id", loginResponse.userId)
                        putString("username", loginResponse.username)
                        apply()
                    }

                    Toast.makeText(this@Login, "Login successful", Toast.LENGTH_SHORT).show()
                    navigateToProfile()
                } else {
                    Toast.makeText(this@Login,
                        "Authentication failed: ${response.errorBody()?.string()}",
                        Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                Toast.makeText(this@Login,
                    "Login failed: ${t.message}",
                    Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun signInWithGoogle() {
        val signInIntent = googleSignInClient.signInIntent
        startActivityForResult(signInIntent, RC_SIGN_IN)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            handleGoogleSignInResult(task)
        }
    }

    private fun handleGoogleSignInResult(completedTask: Task<GoogleSignInAccount>) {
        try {
            val account = completedTask.getResult(ApiException::class.java)
            // Google Sign In was successful, authenticate with your backend server
            val idToken = account.idToken!!
            val googleAuthRequest = GoogleAuthRequest(idToken)

            apiService.googleAuth(googleAuthRequest).enqueue(object : Callback<LoginResponse> {
                override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                    if (response.isSuccessful && response.body() != null) {
                        val loginResponse = response.body()!!

                        // Save the auth token
                        val sharedPref = getSharedPreferences("CartellaPref", MODE_PRIVATE)
                        with(sharedPref.edit()) {
                            putString("auth_token", loginResponse.token)
                            putString("user_id", loginResponse.userId)
                            putString("username", loginResponse.username)
                            apply()
                        }

                        Toast.makeText(this@Login, "Google login successful", Toast.LENGTH_SHORT).show()
                        navigateToProfile()
                    } else {
                        Toast.makeText(this@Login,
                            "Google authentication failed: ${response.errorBody()?.string()}",
                            Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    Toast.makeText(this@Login,
                        "Google login failed: ${t.message}",
                        Toast.LENGTH_SHORT).show()
                }
            })

        } catch (e: ApiException) {
            // Google Sign In failed
            Toast.makeText(this, "Google sign in failed: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun navigateToProfile() {
        val intent = Intent(this, Profile::class.java)
        startActivity(intent)
        finish() // Close login activity
    }
}

// Data classes for API requests and responses
data class LoginRequest(
    val username: String,
    val password: String
)

data class GoogleAuthRequest(
    val idToken: String
)

data class LoginResponse(
    val token: String,
    val userId: String,
    val username: String
)

// Retrofit interface for API calls
interface ApiService {
    @POST("api/login")
    fun login(@Body loginRequest: LoginRequest): Call<LoginResponse>

    @POST("api/auth/google")
    fun googleAuth(@Body googleAuthRequest: GoogleAuthRequest): Call<LoginResponse>
}