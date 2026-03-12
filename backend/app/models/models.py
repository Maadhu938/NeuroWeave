import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, Integer, DateTime, Boolean, Text, ForeignKey, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector

from app.database import Base


class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(128), nullable=True, index=True)
    label = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="general")
    content = Column(Text, nullable=False)
    embedding = Column(Vector(384))  # all-MiniLM-L6-v2 produces 384-d vectors
    strength = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    quiz_score = Column(Float, default=0.0)
    last_reviewed = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_nodes_category", "category"),
        Index("ix_nodes_embedding", "embedding", postgresql_using="ivfflat",
              postgresql_ops={"embedding": "vector_cosine_ops"}),
    )


class KnowledgeEdge(Base):
    __tablename__ = "knowledge_edges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(128), nullable=True, index=True)
    source_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    target_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    weight = Column(Float, default=1.0)
    relation_type = Column(String(100), default="related_to")
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_edges_source", "source_id"),
        Index("ix_edges_target", "target_id"),
    )


class ReviewLog(Base):
    __tablename__ = "review_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(128), nullable=True, index=True)
    node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    reviewed_at = Column(DateTime, default=datetime.utcnow)
    score = Column(Float, nullable=True)  # 0-1 quiz score if applicable


class UploadRecord(Base):
    __tablename__ = "upload_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(128), nullable=True, index=True)
    filename = Column(String(500), nullable=True)
    source_type = Column(String(20), default="file")  # file | text
    concepts_extracted = Column(Integer, default=0)
    relationships_found = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id = Column(String(128), primary_key=True)
    preferences = Column(JSONB, nullable=False, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
