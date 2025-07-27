from flask import Blueprint, request, jsonify
import time
from typing import Dict, List, Optional
import json

ai_bp = Blueprint('ai', __name__)

# AI Model Configuration
AI_MODELS = {
    'claude': {
        'name': 'Claude (Anthropic)',
        'description': 'Excellent for detailed analysis and cultural insights',
        'personality': 'Thoughtful, analytical, culturally aware',
        'voice_id': 'damien_marley'
    },
    'gpt4': {
        'name': 'GPT-4 (OpenAI)',
        'description': 'Great for creative writing and general conversation',
        'personality': 'Creative, versatile, engaging',
        'voice_id': 'shensea'
    },
    'gemini': {
        'name': 'Gemini (Google)',
        'description': 'Strong at research and factual information',
        'personality': 'Informative, precise, helpful',
        'voice_id': 'barrington_levy'
    },
    'grok': {
        'name': 'Grok (xAI)',
        'description': 'Humorous and unconventional perspectives',
        'personality': 'Witty, rebellious, insightful',
        'voice_id': 'jaz_elise'
    },
    'qwen': {
        'name': 'Qwen (Alibaba)',
        'description': 'Multilingual support and cultural diversity',
        'personality': 'Multicultural, inclusive, wise',
        'voice_id': 'jada_kingdom'
    },
    'meta': {
        'name': 'Meta AI',
        'description': 'Social and community-focused responses',
        'personality': 'Social, community-minded, relatable',
        'voice_id': 'buju_banton'
    }
}

# Voice Synthesis Configuration
VOICE_MODELS = {
    'damien_marley': {
        'name': 'Damien Marley',
        'style': 'conscious, thoughtful, spiritual',
        'accent': 'jamaican_patois',
        'tempo': 'moderate'
    },
    'shensea': {
        'name': 'Shensea',
        'style': 'energetic, contemporary, confident',
        'accent': 'modern_jamaican',
        'tempo': 'fast'
    },
    'barrington_levy': {
        'name': 'Barrington Levy',
        'style': 'classic, smooth, experienced',
        'accent': 'traditional_jamaican',
        'tempo': 'moderate'
    },
    'jaz_elise': {
        'name': 'Jaz Elise',
        'style': 'modern, expressive, artistic',
        'accent': 'contemporary_jamaican',
        'tempo': 'moderate_fast'
    },
    'jada_kingdom': {
        'name': 'Jada Kingdom',
        'style': 'bold, contemporary, powerful',
        'accent': 'dancehall_jamaican',
        'tempo': 'fast'
    },
    'buju_banton': {
        'name': 'Buju Banton',
        'style': 'spiritual, wise, authoritative',
        'accent': 'deep_jamaican',
        'tempo': 'slow_moderate'
    }
}

class AIOrchestrator:
    def __init__(self):
        self.conversation_history = {}
        
    def route_query(self, query: str, context: Dict, user_id: str) -> Dict:
        """Route query to the most appropriate AI model based on content and context"""
        
        # Analyze query characteristics
        query_analysis = self._analyze_query(query)
        
        # Select best model based on analysis
        selected_model = self._select_model(query_analysis, context)
        
        # Generate response using selected model
        response = self._generate_response(query, selected_model, context, user_id)
        
        # Add voice synthesis information
        voice_id = AI_MODELS[selected_model]['voice_id']
        response['voice_model'] = VOICE_MODELS[voice_id]
        response['selected_model'] = selected_model
        response['model_info'] = AI_MODELS[selected_model]
        
        return response
    
    def _analyze_query(self, query: str) -> Dict:
        """Analyze query to determine characteristics and routing preferences"""
        query_lower = query.lower()
        
        analysis = {
            'topics': [],
            'complexity': 'medium',
            'intent': 'general',
            'cultural_context': False,
            'creative': False,
            'factual': False
        }
        
        # Topic detection
        if any(word in query_lower for word in ['reggae', 'jamaica', 'rastafari', 'bob marley', 'dancehall']):
            analysis['topics'].append('music_culture')
            analysis['cultural_context'] = True
            
        if any(word in query_lower for word in ['history', 'when', 'where', 'who', 'what happened']):
            analysis['topics'].append('historical')
            analysis['factual'] = True
            
        if any(word in query_lower for word in ['write', 'create', 'compose', 'lyrics', 'poem', 'story']):
            analysis['topics'].append('creative')
            analysis['creative'] = True
            
        if any(word in query_lower for word in ['explain', 'how', 'why', 'what is', 'define']):
            analysis['topics'].append('educational')
            analysis['factual'] = True
            
        # Complexity assessment
        word_count = len(query.split())
        if word_count > 20:
            analysis['complexity'] = 'high'
        elif word_count < 5:
            analysis['complexity'] = 'low'
            
        return analysis
    
    def _select_model(self, analysis: Dict, context: Dict) -> str:
        """Select the most appropriate AI model based on query analysis"""
        
        # Cultural/music queries -> Claude (Damien Marley voice)
        if analysis['cultural_context'] and 'music_culture' in analysis['topics']:
            return 'claude'
            
        # Creative writing -> GPT-4 (Shensea voice)
        if analysis['creative']:
            return 'gpt4'
            
        # Factual/research queries -> Gemini (Barrington Levy voice)
        if analysis['factual'] and not analysis['cultural_context']:
            return 'gemini'
            
        # Complex analytical queries -> Claude
        if analysis['complexity'] == 'high':
            return 'claude'
            
        # Default to GPT-4 for general conversation
        return 'gpt4'
    
    def _generate_response(self, query: str, model: str, context: Dict, user_id: str) -> Dict:
        """Generate response using the selected AI model"""
        
        try:
            if model == 'claude':
                return self._call_claude(query, context, user_id)
            elif model == 'gpt4':
                return self._call_openai(query, context, user_id)
            elif model == 'gemini':
                return self._call_gemini(query, context, user_id)
            elif model == 'grok':
                return self._call_grok(query, context, user_id)
            elif model == 'qwen':
                return self._call_qwen(query, context, user_id)
            elif model == 'meta':
                return self._call_meta(query, context, user_id)
            else:
                return self._fallback_response(query)
                
        except Exception as e:
            print(f"Error generating response with {model}: {str(e)}")
            return self._fallback_response(query, error=str(e))
    
    def _call_claude(self, query: str, context: Dict, user_id: str) -> Dict:
        """Call Anthropic Claude API (Mock response for deployment)"""
        
        cultural_response = f"""
        As a conscious artist and cultural messenger, I see your question about '{query}' as an opportunity to share some deeper reasoning. In our culture, we believe that every question carries the seed of greater understanding. 

        From the perspective of conscious reggae and Jamaican wisdom, this topic connects to our rich heritage of music, spirituality, and cultural resistance. The roots of our music run deep, carrying messages of unity, love, and social consciousness that resonate across the world.

        Let me share some insights that come from the heart of our musical tradition and the wisdom of our ancestors...
        """
        
        return {
            'text': cultural_response.strip(),
            'model_used': 'claude',
            'processing_time': 2.3,
            'confidence': 0.95,
            'cultural_context': True
        }
    
    def _call_openai(self, query: str, context: Dict, user_id: str) -> Dict:
        """Call OpenAI GPT-4 API (Mock response for deployment)"""
        
        creative_response = f"""
        Hey there! Shensea here, and your question about '{query}' got me thinking creatively! 

        You know what I love about this topic? It gives me the chance to blend traditional Jamaican vibes with that modern energy we bring to dancehall today. We're always pushing boundaries while staying true to our roots.

        Let me break this down for you with some fresh perspective and contemporary flair that captures the spirit of modern Jamaica...
        """
        
        return {
            'text': creative_response.strip(),
            'model_used': 'gpt4',
            'processing_time': 1.8,
            'confidence': 0.92,
            'cultural_context': True
        }
    
    def _call_gemini(self, query: str, context: Dict, user_id: str) -> Dict:
        """Call Google Gemini API (Mock response for deployment)"""
        return {
            'text': f"Greetings! As Barrington Levy, with decades of experience in reggae music, I can tell you that '{query}' touches on something important in our musical heritage. Let me share what I've learned through years of performing and living this culture...",
            'model_used': 'gemini',
            'processing_time': 1.5,
            'confidence': 0.88,
            'cultural_context': True
        }
    
    def _call_grok(self, query: str, context: Dict, user_id: str) -> Dict:
        """Call xAI Grok API (Mock response for deployment)"""
        return {
            'text': f"Hey there! Jaz Elise here, and you know what? Your question about '{query}' got me thinking in a whole different way. Let me break this down with some fresh perspective and maybe a little artistic flair...",
            'model_used': 'grok',
            'processing_time': 2.1,
            'confidence': 0.85,
            'cultural_context': True
        }
    
    def _call_qwen(self, query: str, context: Dict, user_id: str) -> Dict:
        """Call Alibaba Qwen API (Mock response for deployment)"""
        return {
            'text': f"Yow! Jada Kingdom speaking, and your question '{query}' is hitting different! Let me give you the real talk from a contemporary perspective, mixing traditional wisdom with modern vibes...",
            'model_used': 'qwen',
            'processing_time': 1.9,
            'confidence': 0.87,
            'cultural_context': True
        }
    
    def _call_meta(self, query: str, context: Dict, user_id: str) -> Dict:
        """Call Meta AI API (Mock response for deployment)"""
        return {
            'text': f"Blessed love! Buju Banton here, and your inquiry about '{query}' resonates with the spiritual vibration. From my journey through music and life, let me share some wisdom that comes from the heart and soul of our people...",
            'model_used': 'meta',
            'processing_time': 2.0,
            'confidence': 0.90,
            'cultural_context': True
        }
    
    def _fallback_response(self, query: str, error: str = None) -> Dict:
        """Provide fallback response when AI models are unavailable"""
        return {
            'text': f"Irie! Thanks for your question about '{query}'. While I'm having some technical difficulties connecting with my full consciousness right now, I want you to know that every question deserves respect and consideration. Please try again in a moment, and I'll be better prepared to share some real insights with you.",
            'model_used': 'fallback',
            'processing_time': 0.1,
            'confidence': 0.5,
            'cultural_context': True,
            'error': error
        }

# Initialize orchestrator
orchestrator = AIOrchestrator()

@ai_bp.route('/models', methods=['GET'])
def get_available_models():
    """Get list of available AI models and their capabilities"""
    return jsonify({
        'models': AI_MODELS,
        'voices': VOICE_MODELS,
        'status': 'active'
    })

@ai_bp.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint for conversational AI"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        user_id = data.get('user_id', 'anonymous')
        context = data.get('context', {})
        
        # Route query and generate response
        response = orchestrator.route_query(message, context, user_id)
        
        return jsonify({
            'success': True,
            'response': response,
            'timestamp': time.time()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_bp.route('/voice/synthesize', methods=['POST'])
def synthesize_voice():
    """Synthesize voice for given text and voice model"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        voice_id = data.get('voice_id', 'damien_marley')
        
        if voice_id not in VOICE_MODELS:
            return jsonify({'error': 'Invalid voice model'}), 400
        
        # Mock voice synthesis response
        voice_info = VOICE_MODELS[voice_id]
        
        return jsonify({
            'success': True,
            'audio_url': f'/api/voice/audio/{voice_id}/{hash(text)}',
            'voice_model': voice_info,
            'duration': len(text) * 0.1,  # Rough estimate
            'text': text
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_bp.route('/conversation/history/<user_id>', methods=['GET'])
def get_conversation_history(user_id):
    """Get conversation history for a user"""
    try:
        history = orchestrator.conversation_history.get(user_id, [])
        
        return jsonify({
            'success': True,
            'history': history,
            'user_id': user_id
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_available': len(AI_MODELS),
        'voices_available': len(VOICE_MODELS),
        'timestamp': time.time()
    })

