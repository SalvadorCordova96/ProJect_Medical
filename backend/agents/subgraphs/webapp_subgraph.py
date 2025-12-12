"""
Subgrafo WebApp - Flujo para usuarios internos vía interfaz web
===============================================================

Este subgrafo maneja las interacciones de usuarios internos (Admin, Podologo, Recepcion)
a través de la aplicación web.

Características:
- Permisos completos según rol RBAC
- No requiere consentimiento explícito
- Acceso a todas las herramientas administrativas
- Flujo optimizado para consultas rápidas

Autor: Sistema
Fecha: 11 de Diciembre, 2025
Fase: 2 - Arquitectura de Subgrafos
"""

import logging
from langgraph.graph import StateGraph, END

from backend.agents.state import AgentState
from backend.agents.nodes import (
    classify_intent,
    check_permissions,
    generate_sql,
    execute_sql,
    generate_response,
)
from backend.agents.nodes.combine_context_node import CombineContextNode

logger = logging.getLogger(__name__)


def build_webapp_subgraph() -> StateGraph:
    """
    Construye el subgrafo para usuarios de la aplicación web.
    
    Flujo:
    1. classify_intent - Determina qué quiere hacer el usuario
    2. check_permissions - Valida permisos RBAC (Admin/Podologo/Recepcion)
    3. combine_context - Combina contexto del usuario
    4. generate_sql - Genera SQL si es query de BD
    5. execute_sql - Ejecuta la query
    6. generate_response - Genera respuesta en lenguaje natural
    
    Returns:
        StateGraph configurado para webapp
    """
    logger.info("🔧 Construyendo subgrafo WebApp")
    
    # Crear grafo con el estado
    subgraph = StateGraph(AgentState)
    
    # Instanciar nodo de combine_context
    combine_context_node = CombineContextNode()
    
    # Agregar nodos del flujo principal
    subgraph.add_node("classify_intent", classify_intent)
    subgraph.add_node("check_permissions", check_permissions)
    subgraph.add_node("combine_context", combine_context_node)
    subgraph.add_node("generate_sql", generate_sql)
    subgraph.add_node("execute_sql", execute_sql)
    subgraph.add_node("generate_response", generate_response)
    
    # Definir punto de entrada
    subgraph.set_entry_point("classify_intent")
    
    # Flujo lineal simple para webapp (usuarios internos de confianza)
    subgraph.add_edge("classify_intent", "check_permissions")
    subgraph.add_edge("check_permissions", "combine_context")
    subgraph.add_edge("combine_context", "generate_sql")
    subgraph.add_edge("generate_sql", "execute_sql")
    subgraph.add_edge("execute_sql", "generate_response")
    subgraph.add_edge("generate_response", END)
    
    logger.info("✅ Subgrafo WebApp construido correctamente")
    
    return subgraph
