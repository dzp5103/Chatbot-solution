from typing import Any, Text, Dict, List
import requests
import datetime
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import random


class ActionWeatherLookup(Action):
    """Custom action to get weather information."""

    def name(self) -> Text:
        return "action_weather_lookup"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Get location from entity or slot
        location = tracker.get_slot("location")
        if not location:
            location = next(tracker.get_latest_entity_values("location"), None)
        
        if not location:
            location = "your area"

        # Mock weather data (in production, use real weather API)
        weather_conditions = [
            "sunny", "cloudy", "rainy", "partly cloudy", "clear"
        ]
        temperature = random.randint(15, 30)
        condition = random.choice(weather_conditions)

        weather_response = f"The weather in {location} is {condition} with a temperature of {temperature}°C."
        
        dispatcher.utter_message(text=weather_response)
        
        return [SlotSet("location", location)]


class ActionTellTime(Action):
    """Custom action to tell current time."""

    def name(self) -> Text:
        return "action_tell_time"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        current_time = datetime.datetime.now().strftime("%H:%M")
        current_date = datetime.datetime.now().strftime("%B %d, %Y")
        
        time_response = f"The current time is {current_time} on {current_date}."
        
        dispatcher.utter_message(text=time_response)
        
        return []


class ActionBookAppointment(Action):
    """Custom action to book appointments."""

    def name(self) -> Text:
        return "action_book_appointment"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Get time from entity
        appointment_time = next(tracker.get_latest_entity_values("time"), None)
        person = next(tracker.get_latest_entity_values("person"), None)
        
        if appointment_time:
            if person:
                response = f"I've scheduled your appointment with {person} for {appointment_time}."
            else:
                response = f"I've scheduled your appointment for {appointment_time}."
            
            dispatcher.utter_message(text=response)
            return [
                SlotSet("appointment_time", appointment_time),
                SlotSet("appointment_confirmed", True)
            ]
        else:
            dispatcher.utter_message(
                text="When would you like to schedule your appointment? Please specify a day or time."
            )
            return []


class ActionFAQResponse(Action):
    """Custom action to handle FAQ responses."""

    def name(self) -> Text:
        return "action_faq_response"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        user_message = tracker.latest_message.get('text', '').lower()
        
        faq_responses = {
            "hours": "We're open Monday-Friday 9AM-6PM, weekends 10AM-4PM.",
            "contact": "You can reach us at contact@example.com or call (555) 123-4567.",
            "services": "We provide consulting, development, and support services.",
            "parking": "Yes, we have free parking available in front of the building.",
            "location": "We're located at 123 Main Street, Downtown.",
            "address": "Our address is 123 Main Street, Downtown, City 12345.",
            "cost": "Pricing varies by service. Contact us for a custom quote.",
        }
        
        # Simple keyword matching for FAQ
        response = "I'd be happy to help! For detailed information, please contact us directly."
        
        for key, answer in faq_responses.items():
            if key in user_message:
                response = answer
                break
        
        dispatcher.utter_message(text=response)
        
        return []


class ActionChitchat(Action):
    """Custom action for chitchat responses."""

    def name(self) -> Text:
        return "action_chitchat"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        user_message = tracker.latest_message.get('text', '').lower()
        
        chitchat_responses = {
            "joke": [
                "Why don't scientists trust atoms? Because they make up everything!",
                "What do you call a fake noodle? An impasta!",
                "Why did the scarecrow win an award? He was outstanding in his field!"
            ],
            "age": "I'm timeless! I was created recently but I learn from every conversation.",
            "color": "I like blue - it reminds me of clear skies and infinite possibilities!",
            "feelings": "I don't have feelings like humans, but I do enjoy helping people!",
            "name": "I'm a Rasa chatbot, but you can call me whatever you'd like!",
            "about": "I'm an AI assistant built with Rasa. I love helping people and learning new things!"
        }
        
        response = "That's an interesting question! I'm here to help with information and tasks."
        
        if "joke" in user_message:
            response = random.choice(chitchat_responses["joke"])
        elif any(word in user_message for word in ["age", "old"]):
            response = chitchat_responses["age"]
        elif "color" in user_message:
            response = chitchat_responses["color"]
        elif "feeling" in user_message:
            response = chitchat_responses["feelings"]
        elif "name" in user_message:
            response = chitchat_responses["name"]
        elif any(word in user_message for word in ["about", "yourself"]):
            response = chitchat_responses["about"]
        
        dispatcher.utter_message(text=response)
        
        return []


class ActionDefaultFallback(Action):
    """Custom fallback action."""

    def name(self) -> Text:
        return "action_default_fallback"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        fallback_responses = [
            "I'm sorry, I didn't understand that. Could you rephrase?",
            "I'm not sure what you mean. Can you try asking differently?",
            "Could you clarify what you're looking for? I'm here to help!",
            "I didn't catch that. Feel free to ask about weather, time, appointments, or our services!"
        ]
        
        response = random.choice(fallback_responses)
        dispatcher.utter_message(text=response)
        
        return []