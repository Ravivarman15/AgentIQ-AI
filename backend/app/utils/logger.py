"""
AGENTIQ AI — Structured Logger
Provides consistent logging throughout the application.
"""

import logging
import sys
from app.config.settings import DEBUG


def get_logger(name: str = "agentiq") -> logging.Logger:
    """Get a configured logger instance."""
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
        )
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG if DEBUG else logging.INFO)

    return logger


# Pre-configured loggers for each module
api_logger = get_logger("agentiq.api")
ml_logger = get_logger("agentiq.ml")
rag_logger = get_logger("agentiq.rag")
db_logger = get_logger("agentiq.db")
