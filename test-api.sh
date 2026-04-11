#!/bin/bash

# Script untuk test semua API endpoint
BASE_URL="http://localhost:8000/api"

echo "========================================="
echo "  API ENDPOINT TESTING"
echo "========================================="
echo ""
echo "Base URL: $BASE_URL"
echo ""
echo "========================================="

# Test 1: GET /api/public/queue/schedule
echo ""
echo "[TEST 1] GET /public/queue/schedule"
echo "Description: Fetch jadwal sidang hari ini"
echo "-----------------------------------------"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/public/queue/schedule" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json")
echo "HTTP Status: $response"
if [ "$response" -eq 200 ]; then
  echo "✅ SUCCESS"
  echo "Response preview:"
  curl -s "$BASE_URL/public/queue/schedule" | head -c 200
else
  echo "❌ FAILED"
  curl -s "$BASE_URL/public/queue/schedule" | head -c 200
fi
echo ""
echo ""

# Test 2: GET /api/public/queue/settings
echo "========================================="
echo "[TEST 2] GET /public/queue/settings"
echo "Description: Fetch app settings"
echo "-----------------------------------------"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/public/queue/settings" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json")
echo "HTTP Status: $response"
if [ "$response" -eq 200 ]; then
  echo "✅ SUCCESS"
  echo "Response preview:"
  curl -s "$BASE_URL/public/queue/settings" | head -c 200
else
  echo "❌ FAILED"
  curl -s "$BASE_URL/public/queue/settings" | head -c 200
fi
echo ""
echo ""

# Test 3: POST /api/public/queue/book
echo "========================================="
echo "[TEST 3] POST /public/queue/book"
echo "Description: Ambil nomor antrian"
echo "-----------------------------------------"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/public/queue/book" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"perkara_id": 1, "pihak_nama": "Test User", "pihak_telepon": "08123456789"}')
echo "HTTP Status: $response"
if [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
  echo "✅ SUCCESS"
  echo "Response preview:"
  curl -s -X POST "$BASE_URL/public/queue/book" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"perkara_id": 1, "pihak_nama": "Test User", "pihak_telepon": "08123456789"}' | head -c 200
else
  echo "❌ FAILED"
  curl -s -X POST "$BASE_URL/public/queue/book" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"perkara_id": 1, "pihak_nama": "Test User", "pihak_telepon": "08123456789"}' | head -c 200
fi
echo ""
echo ""

# Test 4: GET /api/public/queue/status/:nomorPerkara
echo "========================================="
echo "[TEST 4] GET /public/queue/status/:nomorPerkara"
echo "Description: Cek status antrian"
echo "-----------------------------------------"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/public/queue/status/test" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json")
echo "HTTP Status: $response"
if [ "$response" -eq 200 ]; then
  echo "✅ SUCCESS"
  echo "Response preview:"
  curl -s "$BASE_URL/public/queue/status/test" | head -c 200
else
  echo "❌ FAILED"
  curl -s "$BASE_URL/public/queue/status/test" | head -c 200
fi
echo ""
echo ""

echo "========================================="
echo "  TESTING SELESAI"
echo "========================================="
