"""
AGENTIQ AI — Dataset Model
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.database import Base


class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    file_path = Column(String(512))
    sample_path = Column(String(512))
    industry = Column(String(100))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_demo = Column(Boolean, default=False)

    owner = relationship("User", back_populates="datasets")
