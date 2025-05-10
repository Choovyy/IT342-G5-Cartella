package com.example.cartella

import android.os.Bundle
import android.view.MenuItem
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import android.content.Intent

class Dashboard : AppCompatActivity() {

    // Declare the image views
    private lateinit var homeIcon: ImageView
    private lateinit var cartIcon: ImageView
    private lateinit var ordersIcon: ImageView
    private lateinit var notificationsIcon: ImageView
    private lateinit var profileIcon: ImageView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dashboard)  // Make sure this matches your XML layout file

        // Initialize the views
        homeIcon = findViewById(R.id.home_icon)
        cartIcon = findViewById(R.id.cart_icon)
        ordersIcon = findViewById(R.id.orders_icon)
        notificationsIcon = findViewById(R.id.notifications_icon)
        profileIcon = findViewById(R.id.profile_icon)

        // Set any click listeners or logic if needed
        homeIcon.setOnClickListener {
            // Your logic for home icon click
        }

        cartIcon.setOnClickListener {
            val intent = Intent(this, Cart::class.java)
            startActivity(intent)
        }

        ordersIcon.setOnClickListener {
            // Your logic for orders icon click
        }

        notificationsIcon.setOnClickListener {
            // Your logic for notifications icon click
        }

        profileIcon.setOnClickListener {
            val intent = Intent(this, Profile::class.java)
            startActivity(intent)
        }
    }
}

