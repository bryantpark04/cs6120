brench brench$1.toml | grep ",baseline," | awk -F',' '{sum += $3} END {print sum}'
brench brench$1.toml | grep ",tdce," | awk -F',' '{sum += $3} END {print sum}'
brench brench$1.toml | grep ",lvn," | awk -F',' '{sum += $3} END {print sum}'