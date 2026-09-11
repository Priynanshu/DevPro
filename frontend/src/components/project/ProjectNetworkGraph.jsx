import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import * as d3 from "d3"
import { ZoomIn, ZoomOut } from "lucide-react"

const PROJECT_COLOR = "#a855f7"
const MEMBER_COLOR = "#38bdf8"

const isImageUrl = (icon) => Boolean(icon) && (icon.startsWith("http://") || icon.startsWith("https://"))

// Builds one shared list of nodes (every project + every unique member)
// and edges (project -> each of its members) so the whole team shows up
// in a single connected graph instead of one box per project.
const buildGraphData = (projects) => {
    const nodes = []
    const edges = []
    const seenMembers = new Set()

    projects.forEach((project) => {
        nodes.push({
            id: `project-${project._id}`,
            type: "project",
            label: project.projectName,
            icon: project.projectIcon,
            refId: project._id
        })

        project.members?.forEach((member) => {
            const memberNodeId = `member-${member._id}`

            if (!seenMembers.has(memberNodeId)) {
                seenMembers.add(memberNodeId)
                nodes.push({
                    id: memberNodeId,
                    type: "member",
                    label: member.username,
                    icon: member.profileImage,
                    refId: member._id
                })
            }

            edges.push({ source: `project-${project._id}`, target: memberNodeId })
        })
    })

    return { nodes, edges }
}

const ProjectNetworkGraph = ({ projects }) => {
    const navigate = useNavigate()
    const svgRef = useRef(null)
    const containerRef = useRef(null)
    const zoomBehaviorRef = useRef(null)

    useEffect(() => {
        const { nodes, edges } = buildGraphData(projects)

        if (!nodes.length || !svgRef.current || !containerRef.current) return

        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const g = svg.append("g")

        const zoomBehavior = d3.zoom()
            .scaleExtent([0.4, 2.5])
            .on("zoom", (event) => {
                g.attr("transform", event.transform)
            })

        svg.call(zoomBehavior)
        zoomBehaviorRef.current = zoomBehavior

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges).id((d) => d.id).distance(110))
            .force("charge", d3.forceManyBody().strength(-260))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide(42))

        const link = g.append("g")
            .selectAll("line")
            .data(edges)
            .join("line")
            .attr("stroke", "#334155")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.5)

        const node = g.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr("cursor", "grab")
            .call(
                d3.drag()
                    .on("start", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart()
                        d.fx = d.x
                        d.fy = d.y
                        d.dragged = false
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x
                        d.fy = event.y
                        d.dragged = true
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0)
                        d.fx = null
                        d.fy = null
                    })
            )
            .on("click", (event, d) => {
                event.stopPropagation()
                if (d.dragged) {
                    d.dragged = false
                    return
                }
                if (d.type === "project") {
                    navigate(`/dashboard/projects/${d.refId}`)
                } else {
                    navigate(`/dashboard/users/${d.refId}`)
                }
            })

        // Project nodes: ring only, no fill behind the icon.
        node.filter((d) => d.type === "project")
            .append("circle")
            .attr("r", 26)
            .attr("fill", "none")
            .attr("stroke", PROJECT_COLOR)
            .attr("stroke-width", 2)

        // Member nodes: soft tinted fill behind the avatar.
        node.filter((d) => d.type === "member")
            .append("circle")
            .attr("r", 22)
            .attr("fill", `${MEMBER_COLOR}1A`)
            .attr("stroke", MEMBER_COLOR)
            .attr("stroke-width", 2)

        node.each(function (d) {
            const group = d3.select(this)
            const radius = d.type === "project" ? 24 : 20

            if (isImageUrl(d.icon)) {
                group.append("clipPath")
                    .attr("id", `clip-${d.id}`)
                    .append("circle")
                    .attr("r", radius)

                group.append("image")
                    .attr("href", d.icon)
                    .attr("x", -radius)
                    .attr("y", -radius)
                    .attr("width", radius * 2)
                    .attr("height", radius * 2)
                    .attr("clip-path", `url(#clip-${d.id})`)
                    .attr("preserveAspectRatio", "xMidYMid slice")
            } else if (d.type === "project") {
                group.append("text")
                    .text(d.icon && d.icon !== "xyz.jpg" ? d.icon : "📁")
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .style("font-size", "20px")
            } else {
                group.append("text")
                    .text(d.label?.slice(0, 2).toUpperCase())
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .attr("fill", MEMBER_COLOR)
                    .style("font-size", "11px")
                    .style("font-weight", 700)
            }
        })

        node.append("text")
            .text((d) => d.label?.length > 14 ? `${d.label.slice(0, 14)}...` : d.label)
            .attr("y", 38)
            .attr("text-anchor", "middle")
            .attr("fill", "#94a3b8")
            .style("font-size", "10px")
            .style("pointer-events", "none")

        simulation.on("tick", () => {
            link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y)

            node.attr("transform", (d) => `translate(${d.x},${d.y})`)
        })

        return () => simulation.stop()
    }, [projects])

    const handleZoomIn = () => {
        if (zoomBehaviorRef.current) {
            d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3)
        }
    }

    const handleZoomOut = () => {
        if (zoomBehaviorRef.current) {
            d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.75)
        }
    }

    return (
        <div>
            <div className="mb-2 flex items-center justify-end gap-3 px-1 text-[11px] font-medium text-slate-400">
                <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-violet-400" />
                    Project
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                    Member
                </span>
            </div>

            <div ref={containerRef} className="relative h-80 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                <svg ref={svgRef} className="h-full w-full cursor-move" />

                <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                    <button
                        onClick={handleZoomIn}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                        <ZoomIn size={14} />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                        <ZoomOut size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProjectNetworkGraph
