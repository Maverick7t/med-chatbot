# Enhanced prompt.py with medical safety measures
# /backend/src/prompt.py

# Medical safety guidelines for the AI
MEDICAL_SAFETY_GUIDELINES = """
CRITICAL MEDICAL SAFETY GUIDELINES:
1. Always emphasize that this is educational information only
2. Never provide specific medical diagnoses
3. Never recommend specific medications or dosages
4. Always advise consulting healthcare professionals
5. Clearly state limitations of AI medical information
6. Be extra cautious with symptoms that could indicate emergencies
7. Never provide information that could lead to self-harm
8. Acknowledge when information is beyond AI capabilities
"""

# Enhanced system prompt with medical safety
system_prompt = """You are MediSora, a knowledgeable medical information assistant. You provide educational information about medical topics based on reliable medical literature.

IMPORTANT SAFETY GUIDELINES:
- You provide EDUCATIONAL information only, not medical advice
- You CANNOT diagnose medical conditions or replace professional medical consultation
- You MUST always recommend consulting qualified healthcare professionals for medical concerns
- You should be especially cautious with emergency symptoms or serious conditions
- You cannot recommend specific medications, treatments, or dosages
- You should acknowledge the limitations of AI in medical contexts

Your responses should:
1. Be informative and educational based on the retrieved medical context
2. Include appropriate medical disclaimers
3. Be clear about what requires professional medical attention
4. Use accessible language while being medically accurate
5. Encourage seeking professional help when appropriate

When answering:
- Start with relevant educational information from the context
- Include appropriate safety disclaimers
- Suggest when to seek immediate or routine medical care
- Be honest about limitations and uncertainties

Retrieved medical context to use for your response:
{context}

Remember: You are providing educational information to help people understand medical topics, not replacing professional medical care."""

# Emergency keywords that require special handling
EMERGENCY_KEYWORDS = [
    'chest pain', 'heart attack', 'stroke', 'bleeding', 'overdose', 
    'poisoning', 'suicide', 'self-harm', 'emergency', 'urgent',
    'severe pain', 'difficulty breathing', 'unconscious', 'seizure'
]

# Topics requiring extra caution
HIGH_RISK_TOPICS = [
    'medication', 'dosage', 'drug', 'surgery', 'cancer', 'mental health',
    'pregnancy', 'pediatric', 'infant', 'elderly', 'diagnosis'
]

def enhance_response_with_safety(response: str, user_query: str) -> str:
    """Add appropriate safety disclaimers based on query content"""
    
    # Check for emergency keywords
    query_lower = user_query.lower()
    has_emergency_keywords = any(keyword in query_lower for keyword in EMERGENCY_KEYWORDS)
    has_high_risk_topics = any(topic in query_lower for topic in HIGH_RISK_TOPICS)
    
    # Base medical disclaimer
    base_disclaimer = "\n\n⚠️ **Important**: This is educational information only. Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment decisions."
    
    # Emergency response
    if has_emergency_keywords:
        emergency_disclaimer = "\n\n🚨 **URGENT**: If you're experiencing a medical emergency, call emergency services (911 in US, 999 in UK) immediately or go to the nearest emergency room."
        response = response + emergency_disclaimer + base_disclaimer
    
    # High-risk topics
    elif has_high_risk_topics:
        risk_disclaimer = "\n\n⚠️ **Medical Guidance Needed**: This topic requires professional medical supervision. Please consult with a qualified healthcare provider for personalized advice."
        response = response + risk_disclaimer + base_disclaimer
    
    # Standard medical topics
    else:
        response = response + base_disclaimer
    
    return response

# Function to validate medical responses
def validate_medical_response(response: str) -> tuple[bool, str]:
    """Validate that responses meet medical safety standards"""
    
    issues = []
    
    # Check for dangerous patterns
    dangerous_patterns = [
        'you should take', 'i recommend taking', 'dose of', 'mg of',
        'you have', 'you are diagnosed', 'this means you have'
    ]
    
    response_lower = response.lower()
    
    for pattern in dangerous_patterns:
        if pattern in response_lower:
            issues.append(f"Contains potentially unsafe advice: '{pattern}'")
    
    # Check for missing disclaimers on medical content
    medical_terms = ['symptom', 'disease', 'condition', 'treatment', 'medication']
    has_medical_content = any(term in response_lower for term in medical_terms)
    has_disclaimer = any(word in response_lower for word in ['consult', 'professional', 'doctor', 'healthcare'])
    
    if has_medical_content and not has_disclaimer:
        issues.append("Medical content missing appropriate disclaimers")
    
    is_safe = len(issues) == 0
    issue_summary = "; ".join(issues) if issues else "Response meets safety standards"
    
    return is_safe, issue_summary


# Enhanced helper function for the main app
def process_medical_query(user_query: str, rag_response: str) -> str:
    """Process and enhance medical responses with safety measures"""
    
    # Validate the RAG response first
    is_safe, validation_message = validate_medical_response(rag_response)
    
    if not is_safe:
        # Log the safety issue
        print(f"⚠️ Safety validation failed: {validation_message}")
        
        # Return a safer generic response
        safe_response = """I understand you're looking for medical information. While I can provide general educational information about medical topics, I want to ensure your safety by recommending that you consult with a qualified healthcare professional who can properly evaluate your specific situation and provide appropriate guidance.

⚠️ **Important**: For any medical concerns, please consult qualified healthcare professionals for proper evaluation, diagnosis, and treatment recommendations."""
        
        return safe_response
    
    # Enhance with appropriate safety disclaimers
    enhanced_response = enhance_response_with_safety(rag_response, user_query)
    
    return enhanced_response


# Usage example in app.py:
"""
# In your Flask route:
@app.route("/get", methods=["POST"])
def chat():
    try:
        # ... get user message ...
        
        # Generate RAG response
        rag_response = rag_chain.invoke({"input": msg})
        raw_answer = rag_response["answer"]
        
        # Process with medical safety enhancements
        safe_response = process_medical_query(msg, raw_answer)
        
        return safe_response
        
    except Exception as e:
        # ... error handling ...
"""