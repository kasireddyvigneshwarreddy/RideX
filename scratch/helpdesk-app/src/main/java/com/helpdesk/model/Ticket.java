package com.helpdesk.model;

import java.sql.Timestamp;

/**
 * Model class representing a Ticket entity.
 */
public class Ticket {
    private int ticketId;
    private String title;
    private String description;
    private String status;
    private String priority;
    private int requesterId;
    private Integer agentId; // Can be null
    private int categoryId;
    private int slaPolicyId;
    private Timestamp slaResponseDeadline;
    private Timestamp slaResolutionDeadline;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Ticket() {}

    public Ticket(String title, String description, int requesterId, int categoryId, int slaPolicyId) {
        this.title = title;
        this.description = description;
        this.status = "new";
        this.priority = "medium";
        this.requesterId = requesterId;
        this.categoryId = categoryId;
        this.slaPolicyId = slaPolicyId;
    }

    public int getTicketId() { return ticketId; }
    public void setTicketId(int ticketId) { this.ticketId = ticketId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public int getRequesterId() { return requesterId; }
    public void setRequesterId(int requesterId) { this.requesterId = requesterId; }

    public Integer getAgentId() { return agentId; }
    public void setAgentId(Integer agentId) { this.agentId = agentId; }

    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public int getSlaPolicyId() { return slaPolicyId; }
    public void setSlaPolicyId(int slaPolicyId) { this.slaPolicyId = slaPolicyId; }

    public Timestamp getSlaResponseDeadline() { return slaResponseDeadline; }
    public void setSlaResponseDeadline(Timestamp slaResponseDeadline) { this.slaResponseDeadline = slaResponseDeadline; }

    public Timestamp getSlaResolutionDeadline() { return slaResolutionDeadline; }
    public void setSlaResolutionDeadline(Timestamp slaResolutionDeadline) { this.slaResolutionDeadline = slaResolutionDeadline; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "Ticket{" +
                "ticketId=" + ticketId +
                ", title='" + title + '\'' +
                ", status='" + status + '\'' +
                ", priority='" + priority + '\'' +
                ", requesterId=" + requesterId +
                ", agentId=" + agentId +
                ", categoryId=" + categoryId +
                ", slaPolicyId=" + slaPolicyId +
                '}';
    }
}
