from typing import Any, Text, Dict, List
from datetime import datetime
import requests

from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction
from rasa_sdk.types import DomainDict


class ActionGetWeather(Action):
    """Action to get weather information"""

    def name(self) -> Text:
        return "action_get_weather"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Mock weather data - in production, integrate with weather API
        weather_data = {
            "temperature": "22°C",
            "condition": "sunny",
            "humidity": "65%",
            "location": "Current Location"
        }

        response = f"The current weather is {weather_data['condition']} with a temperature of {weather_data['temperature']} and humidity at {weather_data['humidity']}."
        
        dispatcher.utter_message(text=response)

        return []


class ActionGetTime(Action):
    """Action to get current time"""

    def name(self) -> Text:
        return "action_get_time"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        current_time = datetime.now().strftime("%I:%M %p")
        current_date = datetime.now().strftime("%A, %B %d, %Y")
        
        response = f"The current time is {current_time} on {current_date}."
        
        dispatcher.utter_message(text=response)

        return []


class ActionBookAppointment(Action):
    """Action to book an appointment"""

    def name(self) -> Text:
        return "action_book_appointment"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        appointment_date = tracker.get_slot("appointment_date")
        appointment_time = tracker.get_slot("appointment_time")
        
        if appointment_date and appointment_time:
            # Mock booking logic - in production, integrate with booking system
            booking_id = f"BOOK-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            response = f"✅ Appointment booked successfully!\n" \
                      f"📅 Date: {appointment_date}\n" \
                      f"🕐 Time: {appointment_time}\n" \
                      f"📋 Booking ID: {booking_id}\n\n" \
                      f"You will receive a confirmation email shortly."
            
            dispatcher.utter_message(text=response)
        else:
            dispatcher.utter_message(text="I need both date and time to book your appointment.")

        return []


class ActionCancelAppointment(Action):
    """Action to cancel an appointment"""

    def name(self) -> Text:
        return "action_cancel_appointment"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Mock cancellation logic
        response = "I'd be happy to help you cancel your appointment. " \
                  "Could you please provide your booking ID or the appointment details?"
        
        dispatcher.utter_message(text=response)

        return []


class ValidateAppointmentForm(FormValidationAction):
    """Validates the appointment form"""

    def name(self) -> Text:
        return "validate_appointment_form"

    def validate_appointment_date(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate appointment date."""
        
        if slot_value:
            # Basic validation - in production, use proper date parsing
            if any(word in slot_value.lower() for word in ['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']):
                return {"appointment_date": slot_value}
            elif any(char.isdigit() for char in slot_value):
                return {"appointment_date": slot_value}
        
        dispatcher.utter_message(text="Please provide a valid date (e.g., 'tomorrow', 'Monday', or '2024-01-15').")
        return {"appointment_date": None}

    def validate_appointment_time(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate appointment time."""
        
        if slot_value:
            # Basic validation - in production, use proper time parsing
            if any(word in slot_value.lower() for word in ['am', 'pm', ':', 'morning', 'afternoon', 'evening']):
                return {"appointment_time": slot_value}
            elif any(char.isdigit() for char in slot_value):
                return {"appointment_time": slot_value}
        
        dispatcher.utter_message(text="Please provide a valid time (e.g., '2:00 PM', '14:30', or 'morning').")
        return {"appointment_time": None}


class ActionDefaultFallback(Action):
    """Fallback action when the bot doesn't understand"""

    def name(self) -> Text:
        return "action_default_fallback"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        message = "I'm sorry, I didn't understand that. I can help you with:\n" \
                 "• Weather information\n" \
                 "• Booking appointments\n" \
                 "• Current time\n" \
                 "• General conversation\n\n" \
                 "Try rephrasing your request or ask for help!"

        dispatcher.utter_message(text=message)

        return []


class ActionSessionStart(Action):
    """Action executed at the start of each session"""

    def name(self) -> Text:
        return "action_session_start"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Custom session start logic
        return []