import json
import os
import yaml

# Parse pnpm-workspace.yaml to get catalog
with open('pnpm-workspace.yaml', 'r') as f:
    workspace = yaml.safe_load(f)

catalog = workspace.get('catalog', {})

# Find all package.json files
for root, dirs, files in os.walk('.'):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if 'package.json' in files:
        filepath = os.path.join(root, 'package.json')
        with open(filepath, 'r') as f:
            try:
                pkg = json.load(f)
            except:
                continue
        
        modified = False
        for dep_type in ['dependencies', 'devDependencies']:
            if dep_type in pkg:
                for name, version in pkg[dep_type].items():
                    if version.startswith('catalog:'):
                        # Use the version from catalog, default to '*' if not found
                        new_version = catalog.get(name, '*')
                        pkg[dep_type][name] = new_version
                        modified = True
                        
        if modified:
            with open(filepath, 'w') as f:
                json.dump(pkg, f, indent=2)
            print(f"Updated {filepath}")
