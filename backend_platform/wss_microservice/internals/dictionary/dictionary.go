package dictionary

import "embed"

// Words contains the dictionary shipped with the WSS service binary.
//
//go:embed words.txt
var Words embed.FS
