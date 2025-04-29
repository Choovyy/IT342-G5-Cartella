import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../images/Cartella Logo Transparent.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Video Background */}
      <Box
        component="video"
        autoPlay
        muted
        loop
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src="/src/images/home.mp4" type="video/mp4" />
      </Box>

      {/* Content Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          gap: 4,
        }}
      >
        <img
          src={logo}
          alt="Cartella Logo"
          style={{
            width: "300px",
            marginBottom: "20px",
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontFamily: "GDS Didot, serif",
            fontSize: "64px",
            marginBottom: "20px",
          }}
        >
          Welcome to Cartella
        </Typography>

        <Box sx={{ display: "flex", gap: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{
              backgroundColor: "#D32F2F",
              color: "white",
              padding: "12px 40px",
              fontSize: "18px",
              "&:hover": {
                backgroundColor: "#B71C1C",
              },
            }}
          >
            Customer Log In
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/vendor-login")}
            sx={{
              backgroundColor: "#1A1A1A",
              color: "white",
              padding: "12px 40px",
              fontSize: "18px",
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            Vendor Log In
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
