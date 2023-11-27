import csv
import requests

# Replace YOUR_API_KEY with your actual API key
API_KEY = '665e8ad3b1c042f6b2d50196adcf87c3'

# Read the CSV file
with open('mrc_table10.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)

    # Create a new CSV file to store the results
    with open('coords_new.csv', 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)

        # Write the header row to the new file
        writer.writerow(['name', 'latitude', 'longitude'])

        for row in reader:
            # Get the name of the university
            name = row['name']

            # Construct the URL for the OpenCage Geocoding API
            url = f'https://api.opencagedata.com/geocode/v1/json?q={name}&key={API_KEY}'

            # Send a GET request to the API
            response = requests.get(url)

            # Parse the JSON response
            data = response.json()

            # Get the latitude and longitude coordinates
            if data['total_results'] > 0:
                lat = data['results'][0]['geometry']['lat']
                lng = data['results'][0]['geometry']['lng']

                # Write the name and coordinates to the new file
                writer.writerow([name, lat, lng])
            else:
                print(f'Error: No results found for {name}')
