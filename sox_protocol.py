name: SOX PROTOCOL

on:
  schedule:
    - cron: "0 3 * * *"  # 日本時間12時に自動実行
  workflow_dispatch:

jobs:
  run-python:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          pip install yfinance
          pip install pandas
          pip install numpy
          pip install requests

      - name: Run SOX PROTOCOL
        env:
          SOX_MOTOMOTO: ${{ secrets.SOX_MOTOMOTO }}
          SOX_HYOKA: ${{ secrets.SOX_HYOKA }}
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
        run: python sox_protocol.py

