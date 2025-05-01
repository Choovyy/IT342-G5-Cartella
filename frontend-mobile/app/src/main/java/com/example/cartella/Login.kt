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

        val retrofit = Retrofit.Builder()
            .baseUrl("https://it342-g5-cartella.onrender.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        apiService = retrofit.create(ApiService::class.java)

        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()

        googleSignInClient = GoogleSignIn.getClient(this, gso)

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
            signInWithCredentials(username, password)
        }

        val googleButton = findViewById<Button>(R.id.btnGoogle)
        googleButton.setOnClickListener { signInWithGoogle() }

        findViewById<TextView>(R.id.bottomLinks).setOnClickListener {
            startActivity(Intent(this, Register::class.java))
        }
    }

    private fun signInWithCredentials(username: String, password: String) {
        apiService.login(LoginRequest(username, password)).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful && response.body() != null) {
                    val loginResponse = response.body()!!
                    getSharedPreferences("CartellaPref", MODE_PRIVATE).edit().apply {
                        putString("auth_token", loginResponse.token)
                        putString("user_id", loginResponse.userId)
                        putString("username", loginResponse.username)
                        putString("user_type", loginResponse.userType)
                        apply()
                    }
                    navigateToDashboard(loginResponse.userType)
                } else {
                    Toast.makeText(this@Login, "Login failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                Toast.makeText(this@Login, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun signInWithGoogle() {
        startActivityForResult(googleSignInClient.signInIntent, RC_SIGN_IN)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == RC_SIGN_IN) {
            GoogleSignIn.getSignedInAccountFromIntent(data).let { handleGoogleSignInResult(it) }
        }
    }

    private fun handleGoogleSignInResult(completedTask: Task<GoogleSignInAccount>) {
        try {
            completedTask.getResult(ApiException::class.java)?.let { account ->
                apiService.googleAuth(GoogleAuthRequest(account.idToken!!)).enqueue(object : Callback<LoginResponse> {
                    override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                        if (response.isSuccessful && response.body() != null) {
                            val loginResponse = response.body()!!
                            getSharedPreferences("CartellaPref", MODE_PRIVATE).edit().apply {
                                putString("auth_token", loginResponse.token)
                                putString("user_id", loginResponse.userId)
                                putString("username", loginResponse.username)
                                putString("user_type", loginResponse.userType)
                                apply()
                            }
                            navigateToDashboard(loginResponse.userType)
                        }
                    }

                    override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                        Toast.makeText(this@Login, "Google login failed", Toast.LENGTH_SHORT).show()
                    }
                })
            }
        } catch (e: ApiException) {
            Toast.makeText(this, "Google error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun navigateToDashboard(userType: String) {
        val target = if (userType == "vendor") VendorDashboard::class.java else Dashboard::class.java
        startActivity(Intent(this, target))
        finish()
    }
}

data class LoginRequest(val username: String, val password: String)
data class GoogleAuthRequest(val idToken: String)
data class LoginResponse(val token: String, val userId: String, val username: String, val userType: String)

interface ApiService {
    @POST("api/login") fun login(@Body loginRequest: LoginRequest): Call<LoginResponse>
    @POST("api/auth/google") fun googleAuth(@Body googleAuthRequest: GoogleAuthRequest): Call<LoginResponse>
}