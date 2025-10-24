#!/usr/bin/env python3
"""
Simple HTTP Server for Dashboard
Serves the merchant dashboard on localhost:8080 to avoid CORS issues
"""

import http.server
import socketserver
import os
import sys

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("🎯 IdealFit Dashboard Server")
        print("=" * 60)
        print()
        print(f"✅ Server running at: http://localhost:{PORT}")
        print()
        print("📊 Access your dashboard at:")
        print(f"   http://localhost:{PORT}/merchant-master-dashboard.html")
        print()
        print("💡 This avoids CORS issues when connecting to the API")
        print()
        print("Press Ctrl+C to stop")
        print("=" * 60)
        print()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            sys.exit(0)







