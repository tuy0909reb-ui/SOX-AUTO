import os
import unittest
from unittest.mock import Mock, patch

import pandas as pd

import silicon_protocol
import sox_utils


class ProtocolUtilityTests(unittest.TestCase):
    def test_fetch_with_retry_retries_empty_data(self):
        history = pd.DataFrame({"Close": [100.0]})
        ticker = Mock()
        ticker.history.side_effect = [pd.DataFrame(), history]

        with (
            patch.object(sox_utils.yf, "Ticker", return_value=ticker),
            patch.object(sox_utils.time, "sleep"),
        ):
            result = sox_utils.fetch_with_retry("^SOX", attempts=2, delay=0)

        self.assertIs(result, history)
        self.assertEqual(ticker.history.call_count, 2)

    def test_fetch_with_retry_rejects_zero_attempts(self):
        with self.assertRaisesRegex(ValueError, "attempts"):
            sox_utils.fetch_with_retry("^SOX", attempts=0)

    def test_send_discord_skips_when_webhook_is_missing(self):
        with (
            patch.dict(os.environ, {"DISCORD_WEBHOOK_URL": ""}),
            patch.object(sox_utils.requests, "post") as post,
        ):
            sent = sox_utils.send_discord("message")

        self.assertFalse(sent)
        post.assert_not_called()


class SiliconProtocolTests(unittest.TestCase):
    def test_market_data_failure_becomes_data_error_values(self):
        with patch.object(
            silicon_protocol,
            "fetch_with_retry",
            side_effect=RuntimeError("temporary failure"),
        ):
            result = silicon_protocol.get_silicon_cycle_data()

        self.assertEqual(
            result,
            {
                "SOX_HIGH": None,
                "SOX_CLOSE": None,
                "200MA_NOW": None,
                "200MA_TREND": None,
            },
        )


if __name__ == "__main__":
    unittest.main()
