from setuptools import find_pachages, setup

setup(
    name='flask_server', 
    version='0.1.0', 
    packages=find_pachages(), 
    include_package_data=True, 
    zip_safe=False, 
    install_requires=[
        'flask', 
    ], 
)
