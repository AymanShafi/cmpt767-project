import pandas as pd
import json

# Load the CSV file
csv_path = 'mrc_coords.csv'  # Replace with your CSV file path
data = pd.read_csv(csv_path)

# Process for Enrollment Flows
# Assuming 'control' column exists and corresponds to institution type (1: public, 2: nonprofit, 3: forprofit)
data['control'] = data['control'].map({1: 'Public', 2: 'Private Non-profit', 3: 'Private For-profit'})
institution_count = data['control'].value_counts().reset_index()
institution_count.columns = ['type', 'count']
enrollment_nodes = [{"name": inst_type} for inst_type in institution_count['type']]
enrollment_links = [{"source": i, "target": len(enrollment_nodes), "value": count}
                    for i, (inst_type, count) in enumerate(institution_count['count'])]
enrollment_nodes.append({"name": "Total"})  # Add 'Total' node for the target

# Combine nodes and links into a JSON structure
enrollment_sankey_data = {"nodes": enrollment_nodes, "links": enrollment_links}

# Write the JSON data to a file
with open('enrollment_flows.json', 'w') as outfile:
    json.dump(enrollment_sankey_data, outfile)

# Process for Major Selection Trends
major_fields = [
    'pct_business_2000', 'pct_health_2000', 'pct_multidisci_2000',
    'pct_publicsocial_2000', 'pct_stem_2000', 'pct_socialscience_2000',
    'pct_tradepersonal_2000'
]
major_percentages = data[major_fields].sum().reset_index()
major_percentages.columns = ['major', 'percentage']
major_percentages['percentage'] = major_percentages['percentage'] / major_percentages['percentage'].sum() * 100
major_nodes = [{"name": "Total"}] + [{"name": major.split('_')[1].capitalize()} for major in major_fields]
major_links = [{"source": 0, "target": i+1, "value": percentage}
               for i, percentage in enumerate(major_percentages['percentage'])]

# Combine nodes and links into a JSON structure
major_sankey_data = {"nodes": major_nodes, "links": major_links}

# Write the JSON data to a file
with open('major_selection_trends.json', 'w') as outfile:
    json.dump(major_sankey_data, outfile)
