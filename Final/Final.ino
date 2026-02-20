#include <WiFiS3.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  10
#define RST_PIN  9

MFRC522 rfid(SS_PIN, RST_PIN);  // Create MFRC522 instance

// ────────────────────────────────────────────────
// WiFi credentials
const char ssid[]     = "4G-MIFI-7238";          // ← change this
const char pass[]     = "1234567890";      // ← change this

// Static IP configuration
IPAddress ip(192, 168, 100, 108);
IPAddress subnet(255, 255, 255, 0);
IPAddress gateway(192, 168, 100, 1);
IPAddress dnsServer(192, 168, 100, 1);        // same as gateway

WiFiServer server(80);
// Kiosk base URL used for redirects from the Arduino.
// Provided by user: http://localhost:8001/sandosh-prabu-2005
String KIOSK_BASE = "http://localhost:8001/sandosh-prabu-2005";

void setup() {
  Serial.begin(9600);
  while (!Serial);            // wait for Serial Monitor (optional)

  Serial.println("Arduino UNO R4 WiFi → RFID → Web Redirect");

  // Initialize SPI & RFID reader
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("MFRC522 initialized");

  // ────────────────────────────────────────────────
  // Configure static IP **before** connecting
  WiFi.config(ip, dnsServer, gateway, subnet);

  // Connect to Wi-Fi
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    Serial.print("Connecting to ");
    Serial.print(ssid);
    Serial.print(" ... attempt ");
    Serial.println(attempts + 1);

    WiFi.begin(ssid, pass);
    delay(4500);           // give it some time
    attempts++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nFailed to connect to WiFi after many attempts → halting");
    while (true) delay(1000);
  }

  Serial.println("\nConnected to WiFi!");
  printWifiStatus();

  server.begin();
  Serial.println("HTTP server started on port 80");
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  Serial.println("New client connected");

  String request = "";
  String currentLine = "";

  while (client.connected()) {
    if (client.available()) {
      char c = client.read();
      request += c;

      if (c == '\n') {
        if (currentLine.length() == 0) {
          // end of headers → process request
          break;
        }
        currentLine = "";
      } else if (c != '\r') {
        currentLine += c;
      }
    }
  }

  // Look for ?id= in GET line
  String expectedID = "";
  int idPos = request.indexOf("id=");
  if (idPos != -1) {
    int endPos = request.indexOf(" ", idPos + 3);
    if (endPos == -1) endPos = request.indexOf("\n", idPos + 3);
    expectedID = request.substring(idPos + 3, endPos);
    expectedID.toUpperCase();
    expectedID.trim();

    Serial.print("Client requested verification for UID → ");
    Serial.println(expectedID);

    unsigned long timeout = millis() + 60000UL;   // 60 seconds
    bool match = false;
    bool cardSeen = false;

    while (millis() < timeout) {
      if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
        cardSeen = true;

        String uid = "";
        for (byte i = 0; i < rfid.uid.size; i++) {
          if (rfid.uid.uidByte[i] < 0x10) uid += "0";
          uid += String(rfid.uid.uidByte[i], HEX);
        }
        uid.toUpperCase();

        Serial.print("Detected card UID → ");
        Serial.println(uid);

        if (uid == expectedID) {
          match = true;
        }

        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();
        break;                    // one card per request
      }
      delay(40);
    }

    // ────────────────────────────────────────────────
    // Send redirect to kiosk app with status and optional id
    client.println("HTTP/1.1 302 Found");
    if (match) {
      // Successful verification → tell kiosk to continue
      String loc = KIOSK_BASE + "?status=success&id=" + expectedID;
      client.print("Location: ");
      client.println(loc);
      Serial.println("→ Redirecting to KIOSK (match)");
    } else {
      // Failure → send user to payment failed page with reason
      String loc = KIOSK_BASE + "/payment-failed";
      if (cardSeen) {
        loc += "?reason=wrong_card&id=" + expectedID;
        Serial.println("→ Redirecting to KIOSK (wrong card)");
      } else {
        loc += "?reason=no_card";
        Serial.println("→ Redirecting to KIOSK (timeout – no card)");
      }
      client.print("Location: ");
      client.println(loc);
    }
    client.println("Connection: close");
    client.println();
  }
  else {
    // No ?id= parameter → friendly message
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html");
    client.println("Connection: close");
    client.println();
    client.println("<!DOCTYPE html><html><body>");
    client.println("<h2>Missing parameter</h2>");
    client.println("<p>Use: <code>http://&lt;arduino-ip&gt;/?id=yourcarduid</code></p>");
    client.println("</body></html>");
  }

  // Give client time to receive data
  delay(10);
  client.stop();
  Serial.println("Client disconnected\n");
}

void printWifiStatus() {
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  IPAddress local = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(local);

  long rssi = WiFi.RSSI();
  Serial.print("Signal strength (RSSI): ");
  Serial.print(rssi);
  Serial.println(" dBm");
}