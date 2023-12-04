from requests import get
from dotenv import load_dotenv
import os

'''Get city name and return latitude and longitude'''
def get_lat_lon(city):
    url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={os.getenv('API_KEY')}"
    response = get(url)
    data = response.json()
    lat = data[0]["lat"]
    lon = data[0]["lon"]
    return lat, lon

'''Get latitude and longitude and return temperature, humidity, wind speed, description'''
def get_current_weather(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={os.getenv('API_KEY')}&units=metric"
    response = get(url)
    data = response.json()
    temp = data["main"]["temp"]
    humidity= data["main"]["humidity"]
    wind_speed = data["wind"]["speed"]
    description = data["weather"][0]["description"]
    return temp, humidity, wind_speed, description

'''Print output'''
def print_output(city, temp, humidity, wind_speed, description):
    print(f"Weather in {city.title()}:")
    print(f"- Temperature: {temp}°C")
    print(f"- Humidity: {humidity}%")
    print(f"- Wind Speed: {wind_speed} m/s")
    print(f"- Description: {description.capitalize()}")

'''Main function and handing simple user input error like empty string and non alphabets.'''
def main():
    load_dotenv()
    while True:
        try:
            city = input("Enter the name of the city: ")
        except:
            print('Please enter an alphabetical city name')
            continue
        removespace = city.replace(' ','')
        if removespace.isalpha() == False:
            print('Please enter an alphabetical city name')
            continue
        else:
            break

    lat, lon = get_lat_lon(city)
    temp, humidity, wind_speed, description = get_current_weather(lat, lon)
    print_output(city, temp, humidity, wind_speed, description)

main()