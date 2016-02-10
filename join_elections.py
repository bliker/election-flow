import pandas, difflib, json
years = ['2016', '2012']
candidates = {}
parties = {}
party_id_counter = 0

for y in years:
    # Nacitame vsetky strany do dict
    df = pandas.read_excel('data/' + y + ' candidates.xlsx', 'candidates')
    if 'Priezvisko' in df.keys().tolist():
        df['Meno'] = df['Meno'].map(str) + ' ' + df['Priezvisko']
    candidates[y] = df[pandas.notnull(df['Meno'])]

    # Rovnako aj strany ktore maju priradene unikatne "id"
    pt = pandas.read_excel('data/' + y + ' candidates.xlsx', 'parties')
    pt['id'] = pt.index + party_id_counter
    party_id_counter += len(pt)
    parties[y] = pt


grouped = {}

for val in candidates:
    candidates[val] = candidates[val].merge(parties[val],
        how='left',
        left_on='Strana',
        right_on='Číslo'
    )
    grouped[val] = candidates[val].groupby('Skratka')


# for each of the party on the left we have to calculate connections to all the parties to the right
# Nodes = Strany
# Links = Spajaju strany a width urcutje pocet kandidatov kolko preslo z 2012 -> 2015

nodes = []
links = []

for y in years:
    nodes += map(lambda y: {'name': y}, parties[y]['Skratka'].values.tolist())
# raise SystemExit(0)

# We have individual party, now we can evaluate the intersection with all net
# year parties and calculate their score and thr width
def intersection_count(new, args):
    count = len(set(args['Meno']) & set(new['Meno']))
    # Only show links that have more than n people crossing
    if count > 0:
        links.append({
            'source': int(args['id'].unique()[0]),
            'target': int(new['id'].unique()[0]),
            'value' : count
        });

# print(intersection_count(grouped['2012'].get_group('SNS'), grouped['2016'].get_group('SNS')))

years.reverse()
for i, y in enumerate(years):
    if i < len(years) - 1:
        grouped[y].apply(lambda p: grouped[years[i+1]].apply(intersection_count, args=p))
# Na to aby sme spocitali pocet poslancov ktory alebo prisli na kandidatku spocitame
# linky a ich hodnoty

# links_df = pandas.DataFrame(links)
# source_leave = ldf.groupby('source').sum()["value"]
# target_enter = ldf.groupby('target').sum()["value"]

json_file = json.dumps({
    'links': links,
    'nodes': nodes,
}, indent=True)

with open('sankey-data.json', 'w') as file:
    file.write(json_file)
